import { AuthDomainError } from "./auth.errors";

export class InvalidJwtPayloadError extends AuthDomainError {
  constructor(message = "Invalid JWT payload", details?: unknown) {
    super(message, "JWT_PAYLOAD_INVALID", details);
  }
}
