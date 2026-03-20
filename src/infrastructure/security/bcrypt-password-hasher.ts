import bcrypt from "bcryptjs";
import { IPasswordHasherPort } from "../../domain/ports";

/**
 * Hasher bcrypt configurable.
 * Evita hardcode de rounds para que sea controlable por config.
 */
export class BcryptPasswordHasher implements IPasswordHasherPort {
  constructor(private readonly saltRounds = 10) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
