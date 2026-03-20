//src/in-memory/in-memory-credential.repository.ts

import { Credential, ICredentialRepositoryPort, Id } from "../domain";

/**
 * Implementación en memoria del repositorio de credenciales.
 *
 * Soporta múltiples sesiones por usuario (multi-dispositivo) usando `sessionId`.
 */
export class InMemoryCredentialRepository implements ICredentialRepositoryPort {
  /**
   * Fuente de verdad: credenciales indexadas por sessionId.
   */
  private credentialsBySessionId: Map<string, Credential> = new Map();

  /**
   * Índice: userId -> sessionIds (para obtener todas las sesiones del usuario).
   */
  private sessionsByUserId: Map<string, Set<string>> = new Map();

  /**
   * Índice: refreshToken -> sessionId (para refresh rotation).
   *
   * Regla:
   * - Si un refresh token rota, el anterior se “consume” (se elimina del índice).
   * - Esto permite emular la semántica single-use de una rotación atómica en DB.
   */
  private refreshTokenIndex: Map<string, string> = new Map();

  /**
   * Rotación atómica de refresh token (single-use).
   *
   * Retorna:
   * - true: si `currentRefreshToken` existía y coincidía con la credencial actual de la sesión,
   *         y se reemplazó por `nextCredential`.
   * - false: si el refresh token no existe, ya fue consumido, o no coincide con la credencial actual.
   *
   * Invariante:
   * - `nextCredential.sessionId` debe ser el mismo sessionId de la credencial actual.
   */
  public async rotateByRefreshToken(
    currentRefreshToken: string,
    nextCredential: Credential,
  ): Promise<boolean> {
    const sessionKey = this.refreshTokenIndex.get(currentRefreshToken);
    if (!sessionKey) return false;

    const existing = this.credentialsBySessionId.get(sessionKey);
    if (!existing) {
      // índice inconsistente: consumimos el refresh del índice para no “revivirlo”
      this.refreshTokenIndex.delete(currentRefreshToken);
      return false;
    }

    // Single-use real: solo rota si el refresh recibido coincide con el vigente
    if (existing.refreshToken !== currentRefreshToken) return false;

    // Asegurar que la rotación es para la MISMA sesión (programmer error si no)
    const nextSessionKey = nextCredential.sessionId.getValue();
    if (nextSessionKey !== sessionKey) {
      throw new Error(
        "Invariant violation: rotateByRefreshToken requires the same sessionId",
      );
    }

    // 1) Consumir refresh token actual (single-use)
    this.refreshTokenIndex.delete(currentRefreshToken);

    // 2) Reemplazar credencial en la fuente de verdad
    this.credentialsBySessionId.set(sessionKey, nextCredential);

    // 3) Indexar el nuevo refresh token (si existe)
    if (nextCredential.refreshToken) {
      this.refreshTokenIndex.set(nextCredential.refreshToken, sessionKey);
    }

    // 4) Mantener el índice user -> sessions consistente
    const userKey = nextCredential.userId.getValue();
    const sessions = this.sessionsByUserId.get(userKey) ?? new Set<string>();
    sessions.add(sessionKey);
    this.sessionsByUserId.set(userKey, sessions);

    return true;
  }

  /**
   * Guarda (upsert) una credencial por (userId, sessionId).
   * - Si existía una credencial para ese sessionId, limpia el índice de refreshToken viejo.
   * - Actualiza el índice userId -> sessionIds.
   */
  public async save(credential: Credential): Promise<void> {
    const sessionKey = credential.sessionId.getValue();
    const userKey = credential.userId.getValue();

    // Si existía una credencial para esa sesión, limpiar refresh index anterior
    const old = this.credentialsBySessionId.get(sessionKey);
    if (old?.refreshToken) {
      this.refreshTokenIndex.delete(old.refreshToken);
    }

    // Guardar credencial por sesión
    this.credentialsBySessionId.set(sessionKey, credential);

    // Indexar refresh -> session
    if (credential.refreshToken)
      this.refreshTokenIndex.set(credential.refreshToken, sessionKey);

    // Indexar user -> sessions
    const sessions = this.sessionsByUserId.get(userKey) ?? new Set<string>();
    sessions.add(sessionKey);
    this.sessionsByUserId.set(userKey, sessions);
  }

  /**
   * Devuelve todas las credenciales (sesiones) del usuario.
   */
  public async findByUserId(userId: Id): Promise<Credential[]> {
    const userKey = userId.getValue();
    const sessionIds = this.sessionsByUserId.get(userKey);
    if (!sessionIds || sessionIds.size === 0) return [];

    const result: Credential[] = [];
    for (const sid of sessionIds) {
      const c = this.credentialsBySessionId.get(sid);
      if (c) result.push(c);
    }
    return result;
  }

  /**
   * Busca una credencial por sessionId.
   */
  public async findBySessionId(sessionId: Id): Promise<Credential | null> {
    const sessionKey = sessionId.getValue();
    return this.credentialsBySessionId.get(sessionKey) ?? null;
  }

  /**
   * Busca una credencial por refresh token.
   */
  public async findByRefreshToken(
    refreshToken: string,
  ): Promise<Credential | null> {
    const sessionKey = this.refreshTokenIndex.get(refreshToken);
    if (!sessionKey) return null;
    return this.credentialsBySessionId.get(sessionKey) ?? null;
  }

  /**
   * Actualiza una credencial existente.
   * (Mantiene compatibilidad con el port; internamente equivale a save + validación).
   */
  public async update(credential: Credential): Promise<void> {
    const sessionKey = credential.sessionId.getValue();
    const existing = this.credentialsBySessionId.get(sessionKey);
    if (!existing) {
      throw new Error("Credential not found");
    }
    await this.save(credential);
  }

  /**
   * Elimina todas las sesiones del usuario (logout global).
   */
  public async deleteByUserId(userId: Id): Promise<void> {
    const userKey = userId.getValue();
    const sessionIds = this.sessionsByUserId.get(userKey);
    if (!sessionIds || sessionIds.size === 0) return;

    for (const sid of sessionIds) {
      const c = this.credentialsBySessionId.get(sid);
      if (c?.refreshToken) {
        this.refreshTokenIndex.delete(c.refreshToken);
      }
      this.credentialsBySessionId.delete(sid);
    }

    this.sessionsByUserId.delete(userKey);
  }

  /**
   * Elimina una sesión por sessionId (logout por dispositivo).
   */
  public async deleteBySessionId(sessionId: Id): Promise<void> {
    const sessionKey = sessionId.getValue();
    const c = this.credentialsBySessionId.get(sessionKey);
    if (!c) return;

    // limpiar refresh index
    if (c.refreshToken) this.refreshTokenIndex.delete(c.refreshToken);

    // limpiar relación user -> sessions
    const userKey = c.userId.getValue();
    const sessions = this.sessionsByUserId.get(userKey);
    if (sessions) {
      sessions.delete(sessionKey);
      if (sessions.size === 0) this.sessionsByUserId.delete(userKey);
    }

    // borrar credencial
    this.credentialsBySessionId.delete(sessionKey);
  }

  /**
   * Elimina una sesión por refresh token.
   */
  public async deleteByRefreshToken(refreshToken: string): Promise<void> {
    const sessionKey = this.refreshTokenIndex.get(refreshToken);
    if (!sessionKey) return;

    // eliminar el índice solicitado
    this.refreshTokenIndex.delete(refreshToken);

    // eliminar sesión completa (consistente)
    const c = this.credentialsBySessionId.get(sessionKey);
    if (!c) return;

    // solo borra si el refresh coincide con el actual
    if (c.refreshToken !== refreshToken) return;

    await this.deleteBySessionId(c.sessionId);
  }

  /**
   * Método auxiliar para tests.
   */
  public clear(): void {
    this.credentialsBySessionId.clear();
    this.sessionsByUserId.clear();
    this.refreshTokenIndex.clear();
  }
}
