/**
 * Interface for password policy validation.
 */
export interface IPasswordPolicyPort {
  validateStrength(password: string): {
    isValid: boolean;
    errors: string[];
  };
  getRequirements(): string[];
}
