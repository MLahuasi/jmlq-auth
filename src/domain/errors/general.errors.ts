import { AuthDomainError } from "./auth.errors";

export class InvalidInputError extends AuthDomainError {
  constructor(
    message = "Email verification token is required",
    details?: unknown,
  ) {
    super(message, "INVALID_INPUT", details);
  }
}
