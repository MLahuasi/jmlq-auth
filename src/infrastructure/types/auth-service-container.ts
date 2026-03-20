import {
  ICredentialRepositoryPort,
  IPasswordHasherPort,
  IPasswordPolicyPort,
  ITokenServicePort,
  ITokenSessionPort,
  IUserRepositoryPort,
  IPasswordResetTokenPort,
  IEmailVerificationTokenPort,
} from "../../domain/ports";
import {
  ChangePasswordUseCase,
  LoginWithPasswordUseCase,
  LogoutUseCase,
  MeUseCase,
  RefreshTokenUseCase,
  RegisterUserUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  VerifyEmailUseCase,
} from "../../application/use-cases";

/**
 * IAuthServiceContainer es el punto de composición del módulo de autenticación
 * Es un contrato que agrupa todas las dependencias y casos de uso de Auth ya construidos,
 * listos para ser consumidos por una aplicación (API REST, GraphQL, CLI, etc.).
 */
export interface IAuthServiceContainer {
  // Repositories
  // Son dependencias compartidas por múltiples casos de uso.
  // Permiten:
  // - persistir usuarios
  // - manejar sesiones/credenciales
  userRepository: IUserRepositoryPort;
  credentialRepository: ICredentialRepositoryPort;

  // Domain services
  // Encapsulan reglas técnicas pero críticas para el dominio:
  // - hashing de contraseñas
  // - emisión/verificación de tokens
  passwordHasher: IPasswordHasherPort;
  tokenService: ITokenServicePort;

  // Application services
  // Estos servicios no son infraestructura, pero tampoco entidades puras.
  // passwordPolicy
  // - valida fuerza, reglas, longitud, etc.
  // - usada por register, change password y reset
  passwordPolicy: IPasswordPolicyPort;
  // tokenSession
  // - orquesta login, refresh, logout
  // - encapsula rotación y revocación de sesiones
  tokenSession: ITokenSessionPort;

  // Password reset token port (infra-provided)
  // - Maneja tokens exclusivos para reset de contraseña
  // - No es JWT de access/refresh
  // - Debe soportar:
  //   - expiración
  //   - single-use
  passwordResetToken: IPasswordResetTokenPort;

  /**
   * Puerto para la gestión de tokens de verificación de email.
   *
   * Responsabilidad:
   * - Emitir tokens temporales (single-use) asociados a un usuario.
   * - Validar y consumir el token cuando el usuario accede al enlace de verificación.
   */
  emailVerificationToken: IEmailVerificationTokenPort;

  // Use cases
  // Son la única forma correcta de ejecutar lógica de Auth.
  registerUserUseCase: RegisterUserUseCase;
  loginWithPasswordUseCase: LoginWithPasswordUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  logoutUseCase: LogoutUseCase;
  requestPasswordResetUseCase: RequestPasswordResetUseCase;
  resetPasswordUseCase: ResetPasswordUseCase;
  changePasswordUseCase: ChangePasswordUseCase;
  verifyEmailUseCase: VerifyEmailUseCase;
  meUseCase: MeUseCase;
}
