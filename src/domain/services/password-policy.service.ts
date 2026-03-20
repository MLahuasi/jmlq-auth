import { IPasswordPolicyPort } from "../ports";

export class DefaultPasswordPolicy implements IPasswordPolicyPort {
  validateStrength(password: string) {
    const errors: string[] = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(password))
      errors.push("Password must include at least one uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must include at least one lowercase letter");
    if (!/\d/.test(password))
      errors.push("Password must include at least one number");
    if (!/[!@#$%^&*]/.test(password))
      errors.push(
        "Password must include at least one special character (!@#$%^&*)",
      );

    return { isValid: errors.length === 0, errors };
  }

  getRequirements(): string[] {
    return [
      "Minimum 8 characters",
      "At least one uppercase letter",
      "At least one lowercase letter",
      "At least one number",
      "At least one special character (!@#$%^&*)",
    ];
  }
}
