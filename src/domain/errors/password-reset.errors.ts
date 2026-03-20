/**
 * Errores específicos del flujo de reseteo de contraseña.
 * Responsabilidad: representar fallos esperados y mapeables a HTTP.
 */

import { AuthDomainError } from "./auth.errors";

export class PasswordResetTokenInvalidError extends AuthDomainError {
  constructor(msg = "Password reset token is invalid") {
    super(msg, "PASSWORD_RESET_TOKEN_INVALID");
    this.name = "PasswordResetTokenInvalidError";
  }
}

export class PasswordResetTokenExpiredError extends AuthDomainError {
  constructor(msg = "Password reset token has expired") {
    super(msg, "PASSWORD_RESET_TOKEN_EXPIRED");
    this.name = "PasswordResetTokenExpiredError";
  }
}

export class PasswordResetTokenAlreadyUsedError extends AuthDomainError {
  constructor(msg = "Password reset token has already been used") {
    super(msg, "PASSWORD_RESET_TOKEN_ALREADY_USED");
    this.name = "PasswordResetTokenAlreadyUsedError";
  }
}
