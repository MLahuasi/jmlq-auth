import { InvalidJwtPayloadError } from "../../errors";

/**
 * Regla canónica de dominio para el claim estándar `aud` (audience).
 *
 * Propósito:
 * - Aceptar `aud` como string o string[] (según librería/plugin).
 * - Rechazar valores vacíos.
 * - Si es array: normalizar de forma determinista (dedupe + sort),
 *   útil para tests y debugging.
 *
 * Importante:
 * - Esta validación es del CORE (@jmlq/auth).
 * - Los plugins JWT NO deben validar audience; solo entregan payload verificado.
 */
export function optionalAudience(
  value: unknown,
): string | string[] | undefined {
  // aud ausente => ok
  if (value == null) return undefined;

  // aud como string
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) {
      throw new InvalidJwtPayloadError("JWT payload.aud must not be empty", {
        field: "aud",
      });
    }
    return v;
  }

  // aud como string[]
  if (Array.isArray(value)) {
    const items = value
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    if (items.length === 0) {
      throw new InvalidJwtPayloadError(
        "JWT payload.aud must contain at least one non-empty string",
        { field: "aud" },
      );
    }

    // Determinista: sin duplicados y ordenado
    return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
  }

  // Tipo inválido
  throw new InvalidJwtPayloadError(
    "JWT payload.aud must be a string or string[]",
    {
      field: "aud",
      receivedType: typeof value,
    },
  );
}
