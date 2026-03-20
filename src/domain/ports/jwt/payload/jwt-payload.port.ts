/**
 * Payload canónico del core (@jmlq/auth).
 *
 * Importante:
 * - NO depende de librerías (jose, jsonwebtoken, etc.)
 * - El runtime del plugin entrega "claims" como unknown => el core normaliza/valida.
 */
export interface IJWTPayload {
  /** Subject (user ID) */
  sub: string;
  /**
   * Roles embebidos en token (opcional).
   * Nota: en escenarios más estrictos, el host puede NO incluir roles en el JWT.
   */
  roles?: Array<{
    role: string;
  }>;
  // Claims de seguridad adicionales
  jti: string; // JWT ID único
  iss?: string; // Issuer
  /**
   * Audience puede venir como string o string[] (dependiendo de la lib).
   * El core lo acepta y valida.
   */
  aud?: string | string[];

  iat: number;
  exp: number;

  /** claim de sesión (dispositivo) */
  sid: string;

  /**
   * Custom claims del token (opcional).
   * Evitar `any`: los consumers deben castear explícitamente si requieren shape.
   */
  customClaims?: Record<string, unknown>;
}
