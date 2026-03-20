import { randomUUID } from "node:crypto";
import { InvalidIdError } from "../errors";

export class Id {
  private readonly value: string;

  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new InvalidIdError("User ID cannot be empty");
    }
    this.value = id.trim();
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Id): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public static generate(): Id {
    // UUID
    return new Id(randomUUID());
  }
}
