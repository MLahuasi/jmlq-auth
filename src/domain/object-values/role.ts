import { InvalidPermissionError, InvalidRoleError } from "../errors";
import { Permission } from "./permission";

export class Role {
  private readonly value: string;
  private readonly permissions: Set<string>;
  private readonly validRoles: Set<string>;

  constructor(
    role: string,
    permissions: Permission[] = [],
    validRoles?: string[],
  ) {
    if (role == null) {
      throw new InvalidRoleError("Role cannot be null or undefined");
    }
    if (typeof role !== "string") {
      throw new InvalidRoleError("Role must be a string");
    }

    const normalizedRole = role.toLowerCase().trim();
    if (!normalizedRole) {
      throw new InvalidRoleError("Role cannot be empty");
    }

    if (validRoles && validRoles.length > 0) {
      const normalizedValid = validRoles.map((r) => {
        if (r == null || typeof r !== "string") {
          throw new InvalidRoleError("Valid roles must be strings");
        }
        return r.toLowerCase().trim();
      });
      this.validRoles = new Set(normalizedValid);
      if (!this.validRoles.has(normalizedRole)) {
        throw new InvalidRoleError(
          `Invalid role: ${role}. Valid roles are: ${validRoles.join(", ")}`,
        );
      }
    } else {
      this.validRoles = new Set();
    }

    // Valida permissions defensivamente
    for (const p of permissions) {
      if (!(p instanceof Permission)) {
        throw new InvalidPermissionError(
          "Permissions must be Permission instances",
        );
      }
    }

    this.value = normalizedRole;
    this.permissions = new Set(permissions.map((p) => p.getValue()));
  }

  public getValuePublic(): {
    role: string;
  } {
    return {
      role: this.value,
    };
  }

  public getValue(): {
    role: string;
    permissions: string[]; // Incluir permisos aquí para uso interno
  } {
    return {
      role: this.value,
      permissions: Array.from(this.permissions), // Para validaciones server-side
    };
  }

  public getPermissions(): Permission[] {
    return Array.from(this.permissions).map((p) => Permission.create(p));
  }

  public hasPermission(permission: Permission | string): boolean {
    const permissionValue =
      typeof permission === "string"
        ? permission.toLowerCase().trim()
        : permission.getValue();

    // Verificar permiso directo
    if (this.permissions.has(permissionValue)) {
      return true;
    }

    // Verificar con patrones (comodines)
    for (const p of this.permissions) {
      const perm = Permission.create(p);
      if (perm.matches(permissionValue)) {
        return true;
      }
    }

    return false;
  }

  public hasAnyPermission(permissions: (Permission | string)[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  public hasAllPermissions(permissions: (Permission | string)[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  public equals(other: Role): boolean {
    return this.value === other.value;
  }

  public hasRole(roleName: string): boolean {
    return this.value === roleName.toLowerCase().trim();
  }

  public toString(): string {
    return this.value;
  }

  // Método estático para crear roles con validación predefinida
  public static withValidRoles(
    role: string,
    permissions: Permission[] = [],
    validRoles: string[],
  ): Role {
    return new Role(role, permissions, validRoles);
  }

  // Método estático para crear roles sin validación (más flexible)
  public static create(role: string, permissions: Permission[] = []): Role {
    return new Role(role, permissions);
  }

  // Método para crear un nuevo rol con permisos adicionales
  public withPermissions(newPermissions: Permission[]): Role {
    const allPermissions = [...this.getPermissions(), ...newPermissions];
    const validRolesArray =
      this.validRoles.size > 0 ? Array.from(this.validRoles) : undefined;
    return new Role(this.value, allPermissions, validRolesArray);
  }

  // Método para verificar si puede realizar una acción específica
  public canPerform(action: string, resource?: string): boolean {
    const fullPermission = resource ? `${action}:${resource}` : action;
    return this.hasPermission(fullPermission);
  }
}
