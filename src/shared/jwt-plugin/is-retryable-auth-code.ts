import type { AuthErrorCode } from "../../domain/errors";

/**
 * Determina si un error del core (por código) es "retryable".
 *
 * Responsabilidad única:
 * - Decidir reintento SOLO por `code` (sin jose, sin message, sin heurísticas).
 */
export function isRetryableAuthCode(code: AuthErrorCode): boolean {
  return (
    code === "SIGNATURE_INVALID" ||
    code === "ALGORITHM_UNSUPPORTED" ||
    code === "KEY_MISMATCH" ||
    code === "KEY_NOT_FOUND"
  );
}
