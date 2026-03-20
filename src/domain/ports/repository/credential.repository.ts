import { Credential } from "../../entities";
import { Id } from "../../object-values";

/**
 * Repositorio de credenciales (sesiones) por usuario/dispositivo.
 *
 * - Un usuario puede tener múltiples credenciales activas (una por sessionId).
 * - Las operaciones deben permitir revocar por sessionId (logout dispositivo)
 *   y por userId (logout global).
 */
export interface ICredentialRepositoryPort {
  /**
   * Guarda una credencial.
   * Recomendación: tratarlo como UPSERT por (userId, sessionId).
   */
  save(credential: Credential): Promise<void>;

  /**
   * Devuelve todas las sesiones activas del usuario.
   * Antes era 1 credencial; ahora debe ser colección.
   */
  findByUserId(userId: Id): Promise<Credential[]>;

  /**
   * Busca una sesión específica por su identificador (dispositivo).
   */
  findBySessionId(sessionId: Id): Promise<Credential | null>;

  /**
   * Busca credencial por refresh token (para rotación).
   * Debe ser único.
   */
  findByRefreshToken(refreshToken: string): Promise<Credential | null>;

  /**
   * Actualiza una credencial existente.
   * (Opcional si `save` es UPSERT, pero se mantiene para compatibilidad).
   */
  update(credential: Credential): Promise<void>;

  /**
   * Elimina todas las sesiones del usuario (logout global).
   * Reemplaza al anterior `delete(userId)` para evitar ambigüedad.
   */
  deleteByUserId(userId: Id): Promise<void>;

  /**
   * Elimina una sesión por su sessionId (logout por dispositivo).
   */
  deleteBySessionId(sessionId: Id): Promise<void>;

  /**
   * Elimina una sesión por refresh token (logout basado en refresh).
   */
  deleteByRefreshToken(refreshToken: string): Promise<void>;
  /**
   * Rotación atómica de refresh token (single-use).
   *
   * Debe:
   * - “consumir” el refreshToken actual (el entrante) de forma atómica,
   * - y persistir la credencial nueva para la MISMA sessionId.
   *
   * Retorna true si la rotación ocurrió (1 fila afectada),
   * false si el refresh token ya fue usado / revocado / no existe.
   *
   * Nota:
   * - El core NO sabe de hashes.
   * - La implementación infra puede usar refreshTokenHash internamente.
   */
  rotateByRefreshToken(
    currentRefreshToken: string,
    nextCredential: Credential,
  ): Promise<boolean>;
}
