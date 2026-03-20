import { Email, HashedPassword, Id, Role } from "../object-values";
import { IUserProps } from "../props";
import { AccessSnapshot } from "../types";

/**
 *Representa al agregado raíz de dominio del usuario en una arquitectura limpia o DDD (Domain-Driven Design).
 */
export class User {
  /**
   * Identificador único del usuario
   */
  private readonly _id: Id;
  /**
   * Correo electrónico del usuario
   */
  private readonly _email: Email;
  /**
   * Rol del usuario dentro del sistema
   */
  private readonly _roles: Role[];
  /**
   * Contraseña hasheada del usuario
   */
  private _password: HashedPassword;
  /**
   * Indica si el usuario está activo o inactivo
   */
  private _isActive: boolean;
  /**
   * Nuevo: estado de verificación de email.
   */
  private _isEmailVerified: boolean;
  /**
   * Fecha de creación del usuario
   */
  private readonly _createdAt: Date;
  /**
   * Fecha de última actualización del usuario
   */
  private _updatedAt: Date;
  /**
   * Constructor privado para evitar instanciación directa
   * @param props Propiedades del usuario
   */
  constructor(props: IUserProps) {
    this._id = props.id;
    this._email = props.email;
    this._roles = props.roles;
    this._password = props.password;
    this._isActive = props.isActive;
    this._isEmailVerified = props.isEmailVerified;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // Getters
  /**
   * Obtiene el identificador único del usuario
   */
  public get id(): Id {
    return this._id;
  }
  /**
   * Obtiene el correo electrónico del usuario
   */
  public get email(): Email {
    return this._email;
  }
  /**
   * Obtiene el rol del usuario
   */
  public get roles(): Role[] {
    return this._roles;
  }
  /**
   * Obtiene la contraseña hasheada del usuario
   */
  public get password(): HashedPassword {
    return this._password;
  }
  /**
   * Indica si el usuario está activo o inactivo
   */
  public get isActive(): boolean {
    return this._isActive;
  }
  /**
   * Indica si el correo fue verificado.
   */
  public get isEmailVerified(): boolean {
    return this._isEmailVerified;
  }
  /**
   * Obtiene la fecha de creación del usuario
   */
  public get createdAt(): Date {
    return new Date(this._createdAt);
  }
  /**
   * Obtiene la fecha de última actualización del usuario
   */
  public get updatedAt(): Date {
    return new Date(this._updatedAt);
  }

  // Business methods
  /**
   * Marca al usuario como activo
   */
  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }
  /**
   * Marca al usuario como inactivo
   */
  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }
  /**
   * Evalúa si el usuario puede iniciar sesión
   * Política de login:
   * - activo
   * - email verificado
   * @returns Verdadero si el usuario puede iniciar sesión, falso en caso contrario
   */
  public canLogin(): boolean {
    return this._isActive && this._isEmailVerified;
  }

  public verifyEmail(): void {
    if (this._isEmailVerified) return;
    this._isEmailVerified = true;
    this._updatedAt = new Date();
  }

  /**
   * Cambia la contraseña del usuario.
   * Responsabilidad: el agregado actualiza su estado de forma consistente.
   * Reglas de policy/validaciones pertenecen al caso de uso (application).
   */
  public changePassword(newHashedPassword: HashedPassword): void {
    this._password = newHashedPassword;
    this._updatedAt = new Date();
  }

  /**
   * Factory method to create a new User
   * @param email email
   * @param role role
   * @param hashedPassword hashed password
   * @returns New User instance
   */
  public static create(
    email: string,
    roles: Role[],
    hashedPassword: string,
  ): User {
    return new User({
      id: Id.generate(),
      email: new Email(email),
      roles: roles,
      password: new HashedPassword(hashedPassword),
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  /**
   *Reconstitution method for repository
   *Método usado por los repositorios al reconstruir
   *el usuario desde la base de datos o una fuente persistente
   * @param props Propiedades del usuario
   * @returns Nueva instancia de User
   */
  public static reconstitute(props: IUserProps): User {
    return new User(props);
  }

  /**
   * Deriva roles y permissions efectivas desde la entidad.
   *
   * Fuente de datos:
   * - this.roles (Role[])
   * - role.getValue() => { role: string; permissions: string[] }
   *
   * Nota:
   * - Esto NO consulta BDD.
   * - La BDD se consulta en el host (middleware) para autorización “fresca”.
   */
  public getAccessSnapshot(): AccessSnapshot {
    const roles: string[] = [];
    const permissions: string[] = [];

    for (const role of this.roles) {
      const value = role.getValue(); // canónico (incluye permissions)
      roles.push(value.role);
      permissions.push(...value.permissions);
    }

    // Unique + orden determinista (útil para test/debug)
    const uniqSorted = (items: readonly string[]): string[] =>
      Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));

    return {
      userId: this.id.getValue(),
      roles: uniqSorted(roles),
      permissions: uniqSorted(permissions),
    };
  }
}
