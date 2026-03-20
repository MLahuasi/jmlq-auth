import {
  Email,
  EmailAlreadyInUseError,
  IPasswordHasherPort,
  IPasswordPolicyPort,
  PasswordMismatchError,
  PasswordPolicyViolationError,
  Permission,
  Role,
  User,
} from "../../domain";
import { IUserRepositoryPort } from "../../domain/ports/repository";
import { RegisterUserRequest, RegisterUserResponse } from "../dtos";
import { assertPasswordPolicy, assertPasswordsMatch } from "./internal";
import type { IEmailVerificationTokenPort } from "../../domain/ports/auth";
import { TimeParser } from "../../shared/utils";

export class RegisterUserUseCase {
  private static readonly DEFAULT_ROLE = "USER";
  private readonly verifyTokenTtl: string;

  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly passwordHasher: IPasswordHasherPort,
    private readonly passwordPolicy: IPasswordPolicyPort,
    private readonly emailVerificationToken: IEmailVerificationTokenPort,
    opts?: { verifyTokenTtl?: string },
  ) {
    this.verifyTokenTtl = opts?.verifyTokenTtl ?? "30m";
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private static normalizeRoles(
    input?: { role: string; permissions?: string[] }[],
  ) {
    const rolesInput =
      input && input.length > 0
        ? input
        : [{ role: RegisterUserUseCase.DEFAULT_ROLE }];

    return rolesInput.map((r) => {
      const roleName = String(r.role ?? "").trim();
      if (!roleName) {
        throw new PasswordPolicyViolationError(["Role is required"]); // si tienes un error de dominio, cámbialo aquí
      }

      const permissions = (r.permissions ?? [])
        .map((p) => String(p ?? "").trim())
        .filter(Boolean);

      // sin duplicados
      const uniquePermissions = Array.from(new Set(permissions));

      return new Role(
        roleName,
        uniquePermissions.map((p) => new Permission(p)),
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Use case
  // ---------------------------------------------------------------------------

  public async execute(
    request: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    // Validar que el password y su confirmación sean iguales
    assertPasswordsMatch(request.password, request.confirmPassword);

    // Validar policy antes de hacer trabajo costoso (hash)
    assertPasswordPolicy(this.passwordPolicy, request.password);

    // Verificar que el email no esté en uso
    const email = new Email(request.email);
    const exists = await this.userRepository.findByEmail(email);
    if (exists) {
      throw new EmailAlreadyInUseError();
    }

    // Hash de la contraseña
    const hashedPassword = await this.passwordHasher.hash(request.password);

    // Roles (default USER si no viene nada)
    const roles = RegisterUserUseCase.normalizeRoles(request.roles);

    // Crear el usuario
    const user = User.create(request.email, roles, hashedPassword);

    // Guardar en repositorio
    await this.userRepository.save(user);

    // Emitir token de verificación (delivery interno)
    const ttlMs = TimeParser.parseToMilliseconds(this.verifyTokenTtl);
    const issued = await this.emailVerificationToken.issue(user.id, ttlMs);

    // Retornar respuesta
    return {
      id: user.id.getValue(),
      roles: user.roles.map((role) => role.getValuePublic()),
      isActive: user.isActive,
      delivery: {
        email: user.email.getValue(),
        token: issued.token,
        expiresAt: issued.expiresAt.toISOString(),
      },
    };
  }
}
