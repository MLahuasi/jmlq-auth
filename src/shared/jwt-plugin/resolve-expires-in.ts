import { InvalidJwtPayloadError } from "../../domain/errors";

/**
 * Resuelve `expiresIn` para generación de tokens (regla canónica para plugins).
 *
 * Responsabilidad única:
 * - Aplicar precedencia:
 *   1) expiresIn provisto por props
 *   2) defaultExpiresIn del plugin por tokenKind
 * - Si ninguno existe: lanzar InvalidJwtPayloadError (error canónico del core)
 */
export function resolveExpiresIn(args: {
  expiresInFromProps?: string;
  defaultExpiresIn?: string;
  operation: "generateAccessToken" | "generateRefreshToken";
}): string {
  const fromProps = normalizeOptionalNonEmptyString(args.expiresInFromProps);
  if (fromProps) return fromProps;

  const fromDefault = normalizeOptionalNonEmptyString(args.defaultExpiresIn);
  if (fromDefault) return fromDefault;

  throw new InvalidJwtPayloadError("expiresIn is required", {
    field: "expiresIn",
    operation: args.operation,
  });
}

function normalizeOptionalNonEmptyString(
  value: string | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
}
