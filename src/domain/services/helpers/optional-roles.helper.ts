import { InvalidJwtPayloadError } from "../../errors";

export function optionalRoles(
  value: unknown,
): Array<{ role: string }> | undefined {
  if (value == null) return undefined;

  if (!Array.isArray(value)) {
    throw new InvalidJwtPayloadError("JWT payload.roles must be an array", {
      field: "roles",
      receivedType: typeof value,
    });
  }

  const out: Array<{ role: string }> = [];

  for (const item of value) {
    if (item == null || typeof item !== "object") {
      throw new InvalidJwtPayloadError(
        "JWT payload.roles items must be objects",
        {
          field: "roles",
        },
      );
    }

    const obj = item as Record<string, unknown>;
    const role = obj.role;

    if (typeof role !== "string" || !role.trim()) {
      throw new InvalidJwtPayloadError(
        "JWT payload.roles[].role must be a non-empty string",
        {
          field: "roles.role",
        },
      );
    }

    out.push({ role: role.trim() });
  }

  // Si vino array vacío, lo retornamos como [] (válido).
  return out;
}
