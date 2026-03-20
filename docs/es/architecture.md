# @jmlq/auth — Architecture 🏛️

## 🎯 Objetivo

Describir la arquitectura interna del core `@jmlq/auth` y su mapeo real a Clean Architecture.

## ⭐ Importancia

- Mantiene reglas de dominio estables e independientes del transporte.
- Permite intercambiar infraestructura (ORM/JWT/HTTP) sin tocar casos de uso.
- Reduce wiring duplicado gracias a la factory principal.

## 🧱 Componentes principales (lo que expone el paquete)

### Factory principal

- `AuthServiceFactory.create(...)` construye un contenedor con servicios/casos de uso.

Firma real (resumen):

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

### Casos de uso (application)

El contenedor devuelve, entre otros:

- `registerUserUseCase`
- `loginWithPasswordUseCase`
- `refreshTokenUseCase`
- `logoutUseCase`
- `requestPasswordResetUseCase`
- `resetPasswordUseCase`
- `changePasswordUseCase`
- `verifyEmailUseCase`
- `meUseCase`

### Servicios/infra

- `TokenSessionService` (rotación/revocación de refresh)
- `BcryptPasswordHasher` (hash/compare)
- `DefaultPasswordPolicy` (si el host no inyecta otra)

## 🔁 Flujos (diagramas)

### Flujo: Login con password

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

### Flujo: Refresh (rotación)

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

## 🧩 Clean Architecture (mapeo real)

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

- [ ] Implementar ports en el host (repositorios + token service + reset/verify tokens)
- [ ] Construir el contenedor con `AuthServiceFactory.create(...)`
- [ ] Integrar transporte (Express): request validations + cookies/headers + mapping de errores

## ⬅️ Anterior

- [`inicio`](../../README.es.md)

## ➡️ Siguiente

- [Configuración](./configuration.md)
- [Integración Express](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)
