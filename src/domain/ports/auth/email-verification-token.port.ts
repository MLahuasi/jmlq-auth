import type { Id } from "../../object-values";

/**
 * Token de verificación de email (single-use, TTL).
 * Implementación fuera del core (DB/Redis).
 */
export interface IEmailVerificationTokenPort {
  issue(userId: Id, ttlMs: number): Promise<{ token: string; expiresAt: Date }>;

  verify(token: string): Promise<{ userId: Id; expiresAt: Date }>;

  consume(token: string): Promise<{ userId: Id; expiresAt: Date }>;
}
