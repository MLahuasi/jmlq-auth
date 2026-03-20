import { InvalidPermissionError } from "../errors";

export class Permission {
  private readonly value: string;

  constructor(permission: string) {
    if (permission == null) {
      throw new InvalidPermissionError(
        "Permission cannot be null or undefined",
      );
    }

    if (typeof permission !== "string") {
      throw new InvalidPermissionError("Permission must be a string");
    }

    const normalized = permission.toLowerCase().trim();

    if (!normalized) {
      throw new InvalidPermissionError("Permission cannot be empty");
    }

    this.value = normalized;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Permission): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static create(permission: string): Permission {
    return new Permission(permission);
  }

  /** ¿Es comodín total? */
  public isWildcard(): boolean {
    return this.value === "*";
  }

  /**
   * ¿Hace match con el target? Soporta prefijos tipo "read:*".
   * Si el target es inválido (no string o vacío tras trim), devuelve false.
   */
  public matches(targetPermission: string): boolean {
    if (typeof targetPermission !== "string") return false;

    const target = targetPermission.toLowerCase().trim();
    if (!target) return false;

    if (this.isWildcard()) return true;
    if (this.value === target) return true;

    // patrón "algo:*" → prefijo
    if (this.value.endsWith(":*")) {
      const prefix = this.value.slice(0, -1); // elimina '*'
      return target.startsWith(prefix);
    }

    return false;
  }
}
