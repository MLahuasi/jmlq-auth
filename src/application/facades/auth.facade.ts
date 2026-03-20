//src/application/facades/auth.facade.ts

import type { IAuthServiceContainer } from "../../infrastructure";

import type {
  ChangePasswordRequest,
  LoginRequest,
  LogoutRequest,
  MeRequest,
  RefreshTokenRequest,
  RegisterUserRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../dtos/request";

import type {
  ChangePasswordResponse,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RefreshTokenResponse,
  RegisterUserResponse,
  RequestPasswordResetResponse,
  ResetPasswordResponse,
  VerifyEmailResponse,
} from "../dtos/response";

/**
 * Facade delgada para integrar @jmlq/auth en hosts (APIs externas).
 *
 * Propósito:
 * - Ofrecer una API ergonómica y estable.
 * - Delegar 100% la lógica de negocio a los use-cases del container.
 *
 * No hace:
 * - Validaciones de negocio.
 * - Conocimiento de Express, TypeORM, jose, etc.
 *
 * Nota de tipado:
 * - Cada use-case.execute(...) retorna Promise<T>.
 * - Por eso aquí exponemos Promise<T> (NO Promise<Promise<T>>).
 * - Para evitar fragilidad y ruido, tipamos con DTOs públicos (request/response),
 *   no con "index access types" sobre el container.
 */
export class AuthFacade {
  constructor(private readonly container: IAuthServiceContainer) {}

  // -------------------------
  // Identity / Auth flows
  // -------------------------

  public registerUser(
    request: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    return this.container.registerUserUseCase.execute(request);
  }

  public loginWithPassword(request: LoginRequest): Promise<LoginResponse> {
    return this.container.loginWithPasswordUseCase.execute(request);
  }

  public refreshToken(
    request: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return this.container.refreshTokenUseCase.execute(request);
  }

  public logout(request: LogoutRequest): Promise<LogoutResponse> {
    return this.container.logoutUseCase.execute(request);
  }

  public changePassword(
    request: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> {
    return this.container.changePasswordUseCase.execute(request);
  }

  // -------------------------
  // Password reset flows
  // -------------------------

  public requestPasswordReset(
    request: RequestPasswordResetRequest,
  ): Promise<RequestPasswordResetResponse> {
    return this.container.requestPasswordResetUseCase.execute(request);
  }

  public resetPassword(
    request: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    return this.container.resetPasswordUseCase.execute(request);
  }

  public verifyEmail(
    request: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> {
    return this.container.verifyEmailUseCase.execute(request);
  }

  public me(request: MeRequest): Promise<MeResponse> {
    return this.container.meUseCase.execute(request);
  }
}
