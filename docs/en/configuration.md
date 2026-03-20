# Configuration — @jmlq/auth ⚙️

This guide describes **how to configure `@jmlq/auth` in a host** by implementing its ports and building the container.

## Ports your host must implement

`AuthServiceFactory.create(...)` requires these dependencies:

1. `IUserRepositoryPort`
2. `ICredentialRepositoryPort`
3. `ITokenServicePort`
4. `IPasswordResetTokenPort`
5. `IEmailVerificationTokenPort`

> The core only knows **interfaces**. The concrete implementation lives in your infrastructure.

## Building the container (AuthServiceFactory.create)

Real example (simplified) of the composition:

```ts
import { AuthServiceFactory } from "@jmlq/auth";

const auth = AuthServiceFactory.create(
  userRepository,
  credentialRepository,
  tokenService,
  passwordResetToken,
  emailVerificationToken,
  {
    // hashing
    bcryptSaltRounds: 10,

    // session TTLs
    accessTokenTtl: "15m",
    refreshTokenTtl: "7d",

    // flow TTLs (optional)
    // passwordResetTokenTtl: "30m",
    // emailVerificationTokenTtl: "1d",
  },
);
```

### What the factory does internally

- If `passwordPolicy` is not provided, it uses `DefaultPasswordPolicy`.
- Builds `BcryptPasswordHasher` with `bcryptSaltRounds`.
- Builds `TokenSessionService` with TTLs (`accessTokenTtl` / `refreshTokenTtl`).
- Instantiates use cases and returns an `IAuthServiceContainer`.

## Configuration recommendations (host)

### 1) TTLs (Access/Refresh)

Align core TTLs with the host strategy:

- Short access (`15m` typical)
- Long refresh (`7d` typical)

### 2) Rotation and revocation

Ensure your `ICredentialRepositoryPort` persists the relationship:

- `(userId, sessionId)`
- current refresh token (for rotation)

### 3) Password reset and email verification tokens

The host must decide:

- how to issue the token (e.g., random/signed)
- persistence or validation strategy
- expiration (TTL)

Then adapt it to the core via `IPasswordResetTokenPort` and `IEmailVerificationTokenPort`.

## ✅ Checklist

- [ ] Implement `IUserRepositoryPort`
- [ ] Implement `ICredentialRepositoryPort` (session/refresh persistence)
- [ ] Implement `ITokenServicePort` (access/refresh issue/verify)
- [ ] Implement `IPasswordResetTokenPort`
- [ ] Implement `IEmailVerificationTokenPort`
- [ ] Build container with `AuthServiceFactory.create(...)`

## ⬅️ Previous

- [`architecture`](./architecture.md)

## ➡️ Next

- [Express Integration](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)
