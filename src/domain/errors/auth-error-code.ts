/**
 * Códigos canónicos de error del dominio de Auth.
 *
 * Objetivo:
 * - Host / plugins NO deben depender de `error.name` o `message`.
 * - Solo deben mapear por `code`.
 *
 * Nota:
 * - Mantén este catálogo pequeño y estable.
 * - Si agregas un error nuevo, agrega aquí su código.
 */
/**
 * ÚNICA fuente de verdad de los códigos.
 */
export const AUTH_ERROR_CODES = [
  // JWT / sesión
  "TOKEN_INVALID",
  "TOKEN_EXPIRED",
  "TOKEN_MALFORMED", // formato invalido (no header.payload.signature),
  "SIGNATURE_INVALID",
  "AUTHENTICATION_FAILED", // catch-all de autenticación,
  "JWT_ERROR",
  "KEY_MISMATCH",
  "KEY_NOT_FOUND",
  "KEY_MISMATCH",
  "CLAIMS_VALIDATION_ERROR",
  "JWT_PAYLOAD_INVALID",
  "TOKEN_NOT_YET_VALID",
  "JWT_EMPTY",
  "JWT_MALFORMED",
  // Refresh Token
  "ALGORITHM_UNSUPPORTED",
  "KEY_MISMATCH",
  "KEY_NOT_FOUND",

  // Identidad / login
  "INVALID_EMAIL",
  "INVALID_HASHED_PASSWORD",
  "PASSWORD_POLICY_VIOLATION",
  "PASSWORD_MISMATCH",
  "USER_NOT_FOUND",
  "USER_DISABLED",
  "EMAIL_ALREADY_IN_USE",
  "INVALID_PERMISSION",
  "INVALID_ROLE",
  "INVALID_ID",
  "LOGOUT_FAILED",
  "EMAIL_NOT_VERIFIED",

  // Password reset
  "PASSWORD_RESET_TOKEN_INVALID",
  "PASSWORD_RESET_TOKEN_EXPIRED",
  "PASSWORD_RESET_TOKEN_ALREADY_USED",

  "EMAIL_VERIFICATION_TOKEN_INVALID",
  "EMAIL_VERIFICATION_TOKEN_EXPIRED",
  "EMAIL_VERIFICATION_TOKEN_ALREADY_USED",

  //General
  "INVALID_INPUT",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];
