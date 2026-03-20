# @jmlq/auth — Architecture 🏛️

## 🎯 Objective

Describe the internal architecture of the `@jmlq/auth` core and its real mapping to Clean Architecture.

## ⭐ Importance

- Keeps domain rules stable and independent from transport.
- Allows swapping infrastructure (ORM/JWT/HTTP) without modifying use cases.
- Reduces duplicated wiring thanks to the main factory.

## 🧱 Main components (what the package exposes)

### Main factory

- `AuthServiceFactory.create(...)` builds a container with services/use cases.

Real signature (summary):

```ts
AuthServiceFactory.create(
  userRepository,
  credentialRepository,
  tokenService,
  passwordResetToken,
  emailVerificationToken,
  options?,
): IAuthServiceContainer
```

### Use cases (application)

The container returns, among others:

- `registerUserUseCase`
- `loginWithPasswordUseCase`
- `refreshTokenUseCase`
- `logoutUseCase`
- `requestPasswordResetUseCase`
- `resetPasswordUseCase`
- `changePasswordUseCase`
- `verifyEmailUseCase`
- `meUseCase`

### Services / infrastructure

- `TokenSessionService` (refresh rotation/revocation)
- `BcryptPasswordHasher` (hash/compare)
- `DefaultPasswordPolicy` (if the host does not inject another one)

## 🔁 Flows (diagrams)

### Flow: Login with password

```mermaid
sequenceDiagram
  participant Host as Host (API)
  participant UC as LoginWithPasswordUseCase
  participant UR as IUserRepositoryPort
  participant PH as IPasswordHasherPort
  participant TS as TokenSessionService
  participant CR as ICredentialRepositoryPort
  participant JWT as ITokenServicePort

  Host->>UC: execute({email,password})
  UC->>UR: findByEmail(...)
  UC->>PH: compare(password, hashed)
  UC->>TS: createSession(userId)
  TS->>JWT: issueAccessToken(...)
  TS->>JWT: issueRefreshToken(...)
  TS->>CR: save(credential/session)
  UC-->>Host: {accessToken, refreshToken, ...}
```

### Flow: Refresh (rotation)

```mermaid
sequenceDiagram
  participant Host as Host (API)
  participant UC as RefreshTokenUseCase
  participant TS as TokenSessionService
  participant CR as ICredentialRepositoryPort
  participant JWT as ITokenServicePort

  Host->>UC: execute({refreshToken})
  UC->>TS: refresh(refreshToken)
  TS->>JWT: verifyRefreshToken(refreshToken)
  TS->>CR: findBy(userId, sessionId)
  TS->>JWT: issueNewAccessToken(...)
  TS->>JWT: issueNewRefreshToken(...)
  TS->>CR: rotate/save(new refresh)
  UC-->>Host: {accessToken, refreshToken}
```

## 🧩 Clean Architecture (real mapping)

```mermaid
flowchart LR
  subgraph Domain
    VO[Value Objects: Email, Id, Role, Permission, HashedPassword]
    Ports[Ports: IUserRepositoryPort, ICredentialRepositoryPort, IPasswordHasherPort, IPasswordPolicyPort, ITokenServicePort, ITokenSessionPort]
  end

  subgraph Application
    Factory[AuthServiceFactory]
    UCs[UseCases: Register, Login, Refresh, Logout, Remember/Reset/Change, VerifyEmail, Me]
  end

  subgraph Infrastructure
    Bcrypt[BcryptPasswordHasher]
    TokenSession[TokenSessionService]
    Adapters[Host Adapters: repos + token plugin + transport]
  end

  Factory --> UCs
  UCs --> Ports
  Bcrypt --> Ports
  TokenSession --> Ports
  Adapters --> Ports
```

## ✅ Checklist

- [ ] Implement ports in the host (repositories + token service + reset/verify tokens)
- [ ] Build the container with `AuthServiceFactory.create(...)`
- [ ] Integrate transport (Express): request validations + cookies/headers + error mapping

## ⬅️ Previous

- [`home`](../../README.md)

## ➡️ Next

- [Configuration](./configuration.md)
- [Express Integration](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)
