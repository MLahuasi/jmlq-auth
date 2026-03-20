import { InvalidJwtPayloadError } from "../../errors";

export function optionalRecord(
  value: unknown,
  field: string,
): Record<string, unknown> | undefined {
  if (value == null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidJwtPayloadError(`JWT payload.${field} must be an object`, {
      field,
      receivedType: typeof value,
    });
  }
  return value as Record<string, unknown>;
}
