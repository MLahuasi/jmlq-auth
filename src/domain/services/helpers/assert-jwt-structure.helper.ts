import {
  InvalidJwtEmptyError,
  InvalidJwtMalformedError,
} from "../../../domain/errors";

export function assertJwtStructure(token: string): void {
  if (typeof token !== "string" || token.trim().length === 0) {
    throw new InvalidJwtEmptyError();
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new InvalidJwtMalformedError();
  }
}
