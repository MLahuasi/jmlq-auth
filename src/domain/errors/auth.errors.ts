import { AUTH_ERROR_CODES, AuthErrorCode } from "./auth-error-code";

export interface ClaimsIssue {
  path: string; // ej: 'sub', 'aud', 'scope[1]'
  message: string; // ej: 'required', 'not in allowed audience'
}

type AuthErrorLike = {
  code?: unknown;
  message?: unknown;
  name?: unknown;
  details?: unknown;
};

function asAuthErrorLike(value: unknown): AuthErrorLike {
  if (value && typeof value === "object") return value as AuthErrorLike;
  return {};
}

const AUTH_ERROR_CODE_SET: ReadonlySet<string> = new Set<string>(
  AUTH_ERROR_CODES,
);

export function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return typeof value === "string" && AUTH_ERROR_CODE_SET.has(value);
}

export abstract class AuthDomainError extends Error {
  public readonly code: AuthErrorCode;
  public readonly details?: unknown;

  constructor(message: string, code: AuthErrorCode, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = new.target.name;

    // Compatible con V8; ignora silenciosamente en otros engines
    if (
      typeof (Error as unknown as { captureStackTrace?: unknown })
        .captureStackTrace === "function"
    ) {
      (
        Error as unknown as {
          captureStackTrace: (err: Error, ctor: unknown) => void;
        }
      ).captureStackTrace(this, new.target);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }

  /**
   * Guard estable para errores del core.
   *
   * - `instanceof` es el camino ideal, pero puede fallar si hay:
   *   - múltiples copias del paquete en runtime (resolución/hoisting),
   *   - bundles,
   *   - errores creados por hosts que replican forma (code/message).
   *
   * Regla:
   * - Si tiene forma mínima { code: string, message: string }, lo tratamos como AuthDomainError.
   * - El core sigue siendo el “owner” de los códigos y su significado.
   */
  static isAuthError(e: unknown): e is AuthDomainError {
    if (e instanceof AuthDomainError) return true;

    const like = asAuthErrorLike(e);

    // Exigir que code sea uno de los canónicos del core
    return isAuthErrorCode(like.code);
  }
}

/** El token ya no es válido por exp (exp < now) */
export class TokenExpiredError extends AuthDomainError {
  constructor(
    message = "Token has expired",
    details?: { exp?: number; now?: number },
  ) {
    super(message, "TOKEN_EXPIRED", details);
  }
}

/** Formato inválido (no tiene 3 partes, base64url inválido, JSON inválido) */
export class InvalidTokenFormatError extends AuthDomainError {
  constructor(message = "Invalid token format", details?: unknown) {
    super(message, "TOKEN_MALFORMED", details);
  }
}

/** Firma inválida (no coincide con datos/clave) */
export class InvalidSignatureError extends AuthDomainError {
  constructor(message = "Invalid token signature", details?: unknown) {
    super(message, "SIGNATURE_INVALID", details);
  }
}

/** Falla general de autenticación (catch-all) */
export class AuthenticationError extends AuthDomainError {
  constructor(message = "Authentication failed", details?: unknown) {
    super(message, "AUTHENTICATION_FAILED", details);
  }
}

export class SessionAuthError extends AuthDomainError {
  constructor(message = "Session Authentication failed", details?: unknown) {
    super(message, "AUTHENTICATION_FAILED", details);
  }
}

export class EmailNotVerifiedError extends AuthDomainError {
  constructor(message = "Email is not verified", details?: unknown) {
    super(message, "EMAIL_NOT_VERIFIED", details);
  }
}

export class EmailVerificationTokenAlreadyUsedError extends AuthDomainError {
  constructor(
    message = "Email verification token already used",
    details?: unknown,
  ) {
    super(message, "EMAIL_VERIFICATION_TOKEN_ALREADY_USED", details);
  }
}

export class EmailVerificationTokenInvalidError extends AuthDomainError {
  constructor(
    message = "Email verification token is invalid",
    details?: unknown,
  ) {
    super(message, "EMAIL_VERIFICATION_TOKEN_INVALID", details);
  }
}

export class EmailVerificationTokenExpiredError extends AuthDomainError {
  constructor(
    message = "Email verification token has expired",
    details?: unknown,
  ) {
    super(message, "EMAIL_VERIFICATION_TOKEN_EXPIRED", details);
  }
}
