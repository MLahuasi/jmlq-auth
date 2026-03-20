import { AuthDomainError } from "./auth.errors";

export class InvalidJwtEmptyError extends AuthDomainError {
  constructor(message = "Invalid Empty JWT", details?: unknown) {
    super(message, "JWT_EMPTY", details);
  }
}

export class InvalidJwtMalformedError extends AuthDomainError {
  constructor(message = "Invalid Malformed JWT", details?: unknown) {
    super(message, "JWT_MALFORMED", details);
  }
}
