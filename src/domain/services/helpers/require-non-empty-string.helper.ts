import { InvalidJwtPayloadError } from "../../errors";

export function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidJwtPayloadError(
      `JWT payload.${field} must be a non-empty string`,
      {
        field,
      },
    );
  }
  return value.trim();
}
