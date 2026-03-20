import {
  Credential,
  ICredentialRepositoryPort,
  Id,
  IJWTPayload,
  ITokenServicePort,
  ITokenSessionPort,
  IUserRepositoryPort,
  SessionAuthError,
  TokenExpiredError,
  User,
  UserDisabledError,
  UserNotFoundError,
} from "../../domain";

/**
 * Extrae el `sid` (sessionId) del payload de forma segura.
 *
 * Nota:
 * - En la mayoría de implementaciones, `sid` viene como claim plano.
 * - Si tu `ITokenServicePort` lo entrega de otra forma, ajusta aquí (único lugar).
 *
 * Ventaja:
 * - Centraliza la dependencia en el formato del payload (single source of truth).
 *
 * @param payload Payload verificado del JWT.
 * @returns sessionId (sid).
 */
function getSessionIdFromPayload(payload: IJWTPayload): string {
  // Aquí se asume que IJWTPayload expone "sid" como string.
  // Si llegara a ser opcional en el tipo, este método debería retornar string | undefined
  // y el resto del flujo ya está preparado para manejar "falsy".
  return payload.sid;
}

/**
 * Servicio de sesiones de usuario (rotación de refresh token) con soporte multi-dispositivo.
 *
 * Capa:
 * - Infraestructura (orquesta ports y persistencia, no contiene reglas de negocio de Auth)
 *
 * Responsabilidades:
 * - Generar/verificar tokens usando ITokenServicePort (plugin: jose / etc.)
 * - Persistir credenciales por sessionId (1 fila = 1 sesión/dispositivo)
 * - Recuperar usuario desde IUserRepositoryPort
 *
 * Reglas clave (multi-dispositivo):
 * - createSession: crea sessionId nuevo (nuevo dispositivo/sesión)
 * - refreshSession: rota tokens manteniendo el MISMO sessionId (misma sesión)
 * - validateSession: valida JWT + valida que la sesión exista (revocable) y no expirada
 */
export class TokenSessionService implements ITokenSessionPort {
  constructor(
    /**
     * Puerto para operaciones JWT (generar/verificar/expiración).
     * Implementación típica: jose (via @jmlq/auth-plugin-jose).
     */
    private readonly tokenService: ITokenServicePort,

    /**
     * Puerto de usuarios (fuente de verdad del usuario).
     * Se usa para:
     * - encontrar usuario por id (payload.sub)
     * - validar canLogin()
     */
    private readonly userRepository: IUserRepositoryPort,

    /**
     * Puerto de credenciales/sesiones (persistencia revocable).
     * Se usa para:
     * - save / findBySessionId / findByRefreshToken
     * - deleteByRefreshToken / deleteBySessionId
     */
    private readonly credentialRepository: ICredentialRepositoryPort,

    /**
     * Expiración del access token en formato humano.
     * @example "15m"
     *
     * Nota:
     * - La interpretación la hace el tokenService (o un parser interno).
     */
    private readonly accessTokenExpiration: string = "15m",

    /**
     * Expiración del refresh token en formato humano.
     * @example "7d"
     */
    private readonly refreshTokenExpiration: string = "7d",
  ) {}

  /**
   * Emite access/refresh tokens para un usuario y una sesión dada.
   *
   * Este método es el “núcleo” de emisión de tokens y su claim policy.
   *
   * Qué hace:
   * 1) Construye claims del usuario (id/email/roles)
   * 2) Deriva permissions efectivas desde roles (RBAC)
   * 3) Construye customClaims.permissions para que el API pueda autorizar (requirePermissions)
   * 4) Genera access + refresh
   * 5) Obtiene expiresAt desde el accessToken (fuente robusta: tokenService)
   *
   * Importante:
   * - permissions vienen de roles.getValuePublic().permissions
   *   (en el host se “pegan” desde AccessSnapshotResolver)
   *
   * @param user Usuario autenticado.
   * @param sessionId Identificador de sesión/dispositivo.
   */
  private async issueTokens(
    user: User,
    sessionId: Id,
  ): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date }> {
    /**
     * Política:
     * - JWT delgado: NO roles, NO permissions.
     * - Authorization se resuelve en el host (BDD) por middleware/servicio.
     */
    const userClaims = {
      id: user.id.getValue(),
      // email/roles son opcionales y NO se incluyen por defecto.
    };

    // Custom claims: no forzamos nada desde el core.
    // Si el host quiere customClaims, debe hacerlo en su propio flujo/política.
    const customClaims: Record<string, unknown> = {};
    /**
     * Generar access token:
     * - sessionId se coloca en "sid"
     * - expiresIn aplica política de expiración configurada
     * - customClaims adjunta permissions para autorización en el API
     */
    const accessToken = await this.tokenService.generateAccessToken({
      user: userClaims,
      expiresIn: this.accessTokenExpiration,
      sessionId: sessionId.getValue(),
      customClaims,
    });

    /**
     * Generar refresh token:
     * - Mantiene mismo sid
     * - Suele tener expiración mayor
     * - También transporta customClaims (depende de tu política; aquí se incluye por consistencia)
     */
    const refreshToken = await this.tokenService.generateRefreshToken({
      user: userClaims,
      expiresIn: this.refreshTokenExpiration,
      sessionId: sessionId.getValue(),
      customClaims,
    });

    /**
     * Expiración del access token:
     * - Se deriva desde el token (tokenService), evitando parseos propios
     * - Reduce riesgo de inconsistencias entre "exp" y cálculos internos
     */
    const expiresAt = await this.tokenService.getTokenExpiration(accessToken);

    return { accessToken, refreshToken, expiresAt };
  }

  /**
   * Crea una nueva sesión (nuevo dispositivo).
   *
   * Flujo:
   * 1) Genera un sessionId nuevo
   * 2) Emite tokens atados a ese sessionId
   * 3) Construye Credential (entidad de dominio de sesión)
   * 4) Persiste credencial
   *
   * Efecto:
   * - multi-dispositivo: un usuario puede tener N credenciales activas (N sessionId)
   *
   * @param user Usuario autenticado.
   * @returns Credencial persistida para la nueva sesión.
   */
  public async createSession(user: User): Promise<Credential> {
    const sessionId = Id.generate();

    const { accessToken, refreshToken, expiresAt } = await this.issueTokens(
      user,
      sessionId,
    );

    /**
     * Credential representa la sesión activa.
     * Suele incluir:
     * - sessionId
     * - userId
     * - accessToken actual
     * - refreshToken actual
     * - expiresAt (del access)
     */
    const credential = Credential.create(
      sessionId,
      user.id,
      accessToken,
      refreshToken,
      expiresAt,
    );

    await this.credentialRepository.save(credential);
    return credential;
  }

  /**
   * Rota refresh token manteniendo el MISMO sessionId (misma sesión/dispositivo).
   *
   * Flujo:
   * 1) Busca credencial por refreshToken (revocable)
   * 2) Verifica refreshToken (firma/exp)
   * 3) Recupera usuario (payload.sub) y valida canLogin()
   * 4) Re-emite tokens con el MISMO sessionId
   * 5) Reemplaza credencial persistida (delete + save)
   *
   * Seguridad:
   * - Si el refreshToken no existe en repositorio => sesión revocada o token inválido => TokenExpiredError
   * - Verificación JWT también puede lanzar => TokenExpiredError
   *
   * @param refreshToken Refresh token actual.
   * @returns Nueva credencial rotada para la misma sesión.
   */
  public async refreshSession(refreshToken: string): Promise<Credential> {
    const existing =
      await this.credentialRepository.findByRefreshToken(refreshToken);

    // Si no existe el refreshToken en DB, se considera expirado/revocado
    if (!existing) throw new TokenExpiredError();

    /**
     * Verificación criptográfica y claims:
     * - Si la firma o exp fallan => TokenExpiredError
     *
     * Nota:
     * - Se oculta el error real por seguridad (no filtrar detalles al cliente).
     */
    const payload = await this.tokenService
      .verifyRefreshToken(refreshToken)
      .catch(() => {
        throw new TokenExpiredError();
      });

    /**
     * El sub del payload identifica al usuario.
     * Se re-carga para:
     * - validar existencia
     * - validar estado (canLogin)
     * - obtener roles/permisos actuales (si el repo resuelve RBAC en cada fetch)
     */
    const user = await this.userRepository.findById(new Id(payload.sub));
    if (!user) throw new UserNotFoundError();
    if (!user.canLogin()) throw new UserDisabledError();

    /**
     * Mantener identidad de sesión:
     * - NO se crea un sessionId nuevo
     * - Se rota token, pero el dispositivo/sesión sigue siendo el mismo
     */
    const sessionId = existing.sessionId;

    const {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt,
    } = await this.issueTokens(user, sessionId);

    const rotated = Credential.create(
      sessionId,
      user.id,
      accessToken,
      newRefreshToken,
      expiresAt,
    );

    /**
     * Rotación atómica (single-use):
     * - Si otro request ya consumió este refreshToken, esta operación debe fallar.
     * - Evita que el mismo refreshToken se use dos veces bajo concurrencia.
     */
    const rotatedOk = await this.credentialRepository.rotateByRefreshToken(
      refreshToken,
      rotated,
    );

    if (!rotatedOk) {
      // Token ya consumido/revocado/no existe (no filtramos detalle)
      throw new TokenExpiredError();
    }

    return rotated;
  }

  /**
   * Valida una sesión a partir de access token.
   *
   * Este método soporta “revocación” (token válido criptográficamente pero sesión eliminada en DB).
   *
   * Reglas:
   * - JWT debe ser válido (firma/exp/issuer/aud según plugin)
   * - Debe existir `sid` en el payload
   * - La sesión (sid) debe existir en el repositorio
   * - (recomendado) accessToken debe coincidir con el almacenado (solo el último token es válido)
   * - La credencial no debe estar expirada (según su estado interno)
   * - El usuario debe existir y poder loguearse
   *
   * @param accessToken Access token recibido.
   * @returns Usuario si sesión es válida, o null si no lo es.
   */
  public async validateSession(accessToken: string): Promise<User | null> {
    try {
      /**
       * verifyAccessToken:
       * - valida firma y exp y claims críticos según configuración del tokenService
       * - retorna payload tipado como IJWTPayload
       */
      const payload = await this.tokenService.verifyAccessToken(accessToken);

      /**
       * sid:
       * - identifica la sesión/dispositivo
       * - si no existe, no podemos validar sesión revocable => null
       */
      const sid = getSessionIdFromPayload(payload);
      if (!sid) return null;

      /**
       * Validación de sesión en storage:
       * - si no existe => sesión revocada => null
       */
      const credential = await this.credentialRepository.findBySessionId(
        new Id(sid),
      );
      if (!credential) return null;

      /**
       * Validación recomendada:
       * - asegura que solo el último accessToken emitido para esa sesión sea aceptado
       * - previene replay de accessTokens antiguos dentro de la misma sesión
       *
       * Nota:
       * - Esto exige que el repo persista accessToken actual.
       */
      if (credential.accessToken !== accessToken) return null;

      /**
       * Validación de expiración a nivel de credencial:
       * - respaldo adicional (además de "exp" del JWT)
       * - útil si tu sistema modela expiración o revocación interna
       */
      if (credential.isExpired()) return null;

      /**
       * sub del payload identifica al usuario.
       * Se valida existencia y estado.
       */
      const user = await this.userRepository.findById(new Id(payload.sub));

      return user && user.canLogin() ? user : null;
    } catch (e) {
      /**
       * SessionAuthError:
       * - encapsula el error interno (logging/observabilidad)
       * - evita filtrar detalles sensibles al exterior
       */
      throw new SessionAuthError("Session Authentication failed", e);
    }
  }

  /**
   * Revoca una sesión usando refresh token.
   *
   * Uso típico:
   * - logout donde el cliente envía refreshToken (cookie/body)
   *
   * Efecto:
   * - la sesión deja de poder refrescar tokens
   * - si validateSession compara accessToken, también invalida el access actual cuando se borra la credencial
   *
   * @param refreshToken Refresh token actual.
   */
  public async revokeSession(refreshToken: string): Promise<void> {
    await this.credentialRepository.deleteByRefreshToken(refreshToken);
  }

  /**
   * Revoca una sesión por sessionId (logout por dispositivo).
   *
   * Uso típico:
   * - logout selectivo (cerrar solo este dispositivo)
   *
   * @param sessionId Identificador de sesión/dispositivo.
   */
  public async revokeSessionById(sessionId: Id): Promise<void> {
    await this.credentialRepository.deleteBySessionId(sessionId);
  }
}
