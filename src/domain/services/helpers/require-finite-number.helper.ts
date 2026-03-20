import { InvalidJwtPayloadError } from "../../errors";

export function requireFiniteNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidJwtPayloadError(
      `JWT payload.${field} must be a finite number`,
      {
        field,
      },
    );
  }
  return value;
}
