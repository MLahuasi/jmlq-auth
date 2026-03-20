import { Id } from "../../domain/object-values";

import { VerifyEmailRequest, VerifyEmailResponse } from "../dtos";
import {
  IEmailVerificationTokenPort,
  IUserRepositoryPort,
} from "../../domain/ports";
import { InvalidInputError, UserNotFoundError } from "../../domain/errors";

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly emailVerificationToken: IEmailVerificationTokenPort,
  ) {}

  public async execute(
    request: VerifyEmailRequest,
  ): Promise<VerifyEmailResponse> {
    const token = String(request.token ?? "").trim();
    if (!token) {
      // Conservador: si prefieres un error de dominio, puedes crear uno específico.
      if (!token) {
        throw new InvalidInputError("Email verification token is required", {
          field: "token",
        });
      }
    }

    const consumed = await this.emailVerificationToken.consume(token);
    const user = await this.userRepository.findById(
      new Id(consumed.userId.getValue()),
    );

    if (!user) throw new UserNotFoundError();

    user.verifyEmail();
    await this.userRepository.update(user);

    return { success: true, message: "Email verified successfully" };
  }
}
