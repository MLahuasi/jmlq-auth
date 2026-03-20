import type { IUserRepositoryPort } from "../../domain/ports";
import { Id } from "../../domain/object-values";

import { MeRequest, MeResponse } from "../dtos";
import { UserNotFoundError } from "../../domain";

export class MeUseCase {
  constructor(private readonly userRepository: IUserRepositoryPort) {}

  public async execute(request: MeRequest): Promise<MeResponse> {
    const userId = String(request.userId ?? "").trim();
    if (!userId) throw new Error("userId is required");

    const user = await this.userRepository.findById(new Id(userId));
    if (!user) throw new UserNotFoundError();

    return {
      id: user.id.getValue(),
      email: user.email.getValue(),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      roles: user.roles.map((r) => r.getValuePublic()),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
