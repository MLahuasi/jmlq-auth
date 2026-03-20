/**
 * Errores del dominio relacionados a identidad/credenciales.
 * Ahora incluyen `code` canónico para que host/plugins mapeen por `code`.
 */

import { AuthDomainError } from "./auth.errors";

export class InvalidEmailError extends AuthDomainError {
  constructor(value: string) {
    super(`Invalid email format: "${value}"`, "INVALID_EMAIL");
    this.name = "InvalidEmailError";
  }
}

export class InvalidHashedPasswordError extends AuthDomainError {
  constructor(msg = "Invalid bcrypt hash format") {
    super(msg, "INVALID_HASHED_PASSWORD");
    this.name = "InvalidHashedPasswordError";
  }
}

export class PasswordPolicyViolationError extends AuthDomainError {
  public readonly issues: string[];

  constructor(issues: string[], msg = "Password policy violation") {
    super(msg, "PASSWORD_POLICY_VIOLATION", { issues: issues.join(",") });
    this.name = "PasswordPolicyViolationError";
    this.issues = issues;
  }
}

export class PasswordMismatchError extends AuthDomainError {
  constructor(msg = "Password does not match") {
    super(msg, "PASSWORD_MISMATCH");
    this.name = "PasswordMismatchError";
  }
}

export class UserNotFoundError extends AuthDomainError {
  constructor(msg = "User not found") {
    super(msg, "USER_NOT_FOUND");
    this.name = "UserNotFoundError";
  }
}

export class UserDisabledError extends AuthDomainError {
  constructor(msg = "User is disabled") {
    super(msg, "USER_DISABLED");
    this.name = "UserDisabledError";
  }
}

export class EmailAlreadyInUseError extends AuthDomainError {
  constructor(msg = "Email already in use") {
    super(msg, "EMAIL_ALREADY_IN_USE");
    this.name = "EmailAlreadyInUseError";
  }
}

export class InvalidPermissionError extends AuthDomainError {
  constructor(message: string) {
    super(message, "INVALID_PERMISSION");
    this.name = "InvalidPermissionError";
  }
}

export class InvalidRoleError extends AuthDomainError {
  constructor(message: string) {
    super(message, "INVALID_ROLE");
    this.name = "InvalidRoleError";
  }
}

export class InvalidIdError extends AuthDomainError {
  constructor(message: string) {
    super(message, "INVALID_ID");
    this.name = "InvalidIdError";
  }
}

export class LogoutError extends AuthDomainError {
  constructor(message: string, details?: unknown) {
    super(message, "LOGOUT_FAILED", details);
    this.name = "LogoutError";
  }
}
