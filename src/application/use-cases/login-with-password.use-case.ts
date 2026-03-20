import {
  IPasswordHasherPort,
  ITokenSessionPort,
  IUserRepositoryPort,
} from "../../domain/ports";
import { LoginRequest, LoginResponse } from "../dtos";
import { Email } from "../../domain/object-values";
import {
  EmailNotVerifiedError,
  PasswordMismatchError,
  UserDisabledError,
  UserNotFoundError,
} from "../../domain/errors";

export class LoginWithPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly passwordHasher: IPasswordHasherPort,
    private readonly tokenSessionService: ITokenSessionPort,
  ) {}

  public async execute(request: LoginRequest): Promise<LoginResponse> {
    // Buscar usuario por email
    const email = new Email(request.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNotFoundError("Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new EmailNotVerifiedError();
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UserDisabledError("User account is not active");
    }

    // Verificar contraseña
    const isPasswordValid = await this.passwordHasher.compare(
      request.password,
      user.password.serialize(),
    );

    if (!isPasswordValid) {
      throw new PasswordMismatchError("Invalid credentials");
    }

    // Crear sesión con tokens
    const credential = await this.tokenSessionService.createSession(user);

    // Retornar respuesta
    return {
      sessionId: credential.sessionId.getValue(),
      accessToken: credential.accessToken,
      refreshToken: credential.refreshToken,
    };
  }
}
