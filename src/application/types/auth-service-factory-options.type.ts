import type { IPasswordPolicyPort } from "../../domain/ports";
/**
 * Permite ajustar parámetros operativos de Auth sin conocer ni tocar la construcción interna del core.
 * Es decir: configura “políticas” y “valores por defecto” que la factory usará al armar el container.
 */
export interface AuthServiceFactoryOptions {
  /**
   * Controla el costo computacional del hashing con bcrypt
   * - Qué hace: define cuántas rondas (work factor) usa bcrypt al generar hashes.
   * - Impacto:
   *   - Mayor valor ⇒ más seguro contra ataques de fuerza bruta, pero más CPU/latencia en register/login/change/reset password.
   *   - Menor valor ⇒ más rápido, pero menos robusto.
   */
  bcryptSaltRounds?: number;
  /**
   * Permite reemplazar la política de password por defecto del core.
   * - Si no se envía, el core usa DefaultPasswordPolicy.
   * - Si se envía, se utiliza esta policy (host-defined).
   */
  passwordPolicy?: IPasswordPolicyPort;
  /**
   * Define el tiempo de vida por defecto de los access tokens.
   * - Qué hace: determina el exp (expiración) con el que se generan access tokens (si tu tokenSession/token service usa este default).
   * - Formato: string “humana” (ej. "15m", "1h"), que el core normaliza.
   * - Impacto:
   *   - Más corto ⇒ más seguridad, más refresh frecuente.
   *   - Más largo ⇒ mejor UX, más riesgo si el token se filtra.
   */
  accessTokenTtl?: string;
  /**
   * Define el tiempo de vida por defecto de los refresh tokens.
   * - Qué hace: determina la expiración del refresh token (el que permite rotar/renovar access tokens).
   * - Formato: "7d", "30d", etc.
   * - Impacto:
   *   - Más corto ⇒ limita ventana de secuestro de sesión, pero obliga re-login más seguido.
   *   - Más largo ⇒ sesiones persistentes, más riesgo si el refresh token se compromete.
   */
  refreshTokenTtl?: string;
  /**
   * Define el tiempo de vida del token de recuperación de contraseña (RememberPassword).
   * - Qué hace: controla cuánto dura el token que se entrega en el email de “reset password”.
   * - Formato: "15m", "30m", "1h", etc
   * - Impacto:
   *  - Más corto ⇒ más seguro (menos ventana), pero el usuario puede no alcanzar a usarlo.
   *  - Más largo ⇒ mejor conveniencia, pero incrementa exposición.
   */
  passwordResetTokenTtl?: string;

  emailVerificationTokenTtl?: string;
}
