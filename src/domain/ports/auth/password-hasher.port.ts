/**
 * Interface for password hashing and comparison.
 */
export interface IPasswordHasherPort {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
