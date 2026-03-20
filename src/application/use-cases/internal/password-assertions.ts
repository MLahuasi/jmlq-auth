import type { IPasswordPolicyPort } from "../../../domain/ports";
import {
  PasswordMismatchError,
  PasswordPolicyViolationError,
} from "../../../domain/errors";

/**
 * Asserts that `newPassword` equals `confirmPassword`.
 *
 * Application-level validation to keep use cases small and consistent.
 */
export function assertPasswordsMatch(
  newPassword: string,
  confirmPassword: string,
): void {
  if (newPassword !== confirmPassword) {
    throw new PasswordMismatchError("Passwords do not match");
  }
}

/**
 * Asserts that `password` satisfies the configured password policy.
 *
 * This runs BEFORE hashing to fail fast and reduce CPU cost.
 */
export function assertPasswordPolicy(
  passwordPolicy: IPasswordPolicyPort,
  password: string,
): void {
  const strength = passwordPolicy.validateStrength(password);

  if (!strength.isValid) {
    throw new PasswordPolicyViolationError(strength.errors);
  }
}
