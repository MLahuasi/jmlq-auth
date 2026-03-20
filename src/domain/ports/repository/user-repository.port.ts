import { User } from "../../entities";
import { Email, Id } from "../../object-values";

/**
 * UserRepository defines the contract for user data persistence operations.
 */
export interface IUserRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: Id): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: Id): Promise<void>;
  exists(email: Email): Promise<boolean>;
}
