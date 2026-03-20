import type { Id } from "../../object-values";

/**
 * Contrato para emitir/verificar/consumir tokens de reseteo de contraseña.
 *
 * - No usa JWT de access/refresh (separación de responsabilidades).
 * - Debe soportar TTL y "single-use" (consumir token).
 * - La implementación vive fuera del core (API REST: DB/Redis/etc).
 */
export interface IPasswordResetTokenPort {
  /**
   * Emite un token para permitir reset de password.
   *
   * @param userId Usuario destino del reset.
   * @param ttlMs Tiempo de vida en milisegundos.
   */
  issue(
    userId: Id,
    ttlMs: number,
  ): Promise<{
    token: string;
    expiresAt: Date;
  }>;

  /**
   * Verifica token sin consumirlo.
   * Útil para validaciones previas si la implementación lo requiere.
   */
  verify(token: string): Promise<{
    userId: Id;
    expiresAt: Date;
  }>;

  /**
   * Consume el token (single-use). Si ya fue usado o es inválido, debe fallar.
   * Recomendación: consumo atómico (transacción) en implementaciones con DB/Redis.
   */
  consume(token: string): Promise<{
    userId: Id;
    expiresAt: Date;
  }>;
}
