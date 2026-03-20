# Configuración — @jmlq/auth ⚙️

Esta guía describe **cómo configurar `@jmlq/auth` en un host** implementando sus puertos (ports) y construyendo el contenedor.

## Ports que tu host debe implementar

`AuthServiceFactory.create(...)` requiere estas dependencias:

1. `IUserRepositoryPort`
2. `ICredentialRepositoryPort`
3. `ITokenServicePort`
4. `IPasswordResetTokenPort`
5. `IEmailVerificationTokenPort`

> El core solo conoce **interfaces**. La implementación concreta vive en tu infraestructura.

## Construcción del contenedor (AuthServiceFactory.create)

Ejemplo real (resumido) de la composición:

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

    // TTLs de sesión
    accessTokenTtl: "15m",
    refreshTokenTtl: "7d",

    // TTLs de flows (opcionales)
    // passwordResetTokenTtl: "30m",
    // emailVerificationTokenTtl: "1d",
  },
);
```

### Qué hace internamente la factory

- Si no se provee `passwordPolicy`, usa `DefaultPasswordPolicy`.
- Construye `BcryptPasswordHasher` con `bcryptSaltRounds`.
- Construye `TokenSessionService` con TTLs (`accessTokenTtl`/`refreshTokenTtl`).
- Instancia casos de uso y devuelve un `IAuthServiceContainer`.

## Recomendaciones de configuración (host)

### 1) TTLs (Access/Refresh)

Alinea los TTLs del core con la estrategia del host:

- Access corto (`15m` típico)
- Refresh largo (`7d` típico)

### 2) Rotación y revocación

Asegúrate que tu `ICredentialRepositoryPort` persista la relación:

- `(userId, sessionId)`
- refresh token actual (para rotación)

### 3) Tokens de reset y verificación de email

El host debe decidir:

- forma de emitir el token (ej. aleatorio/firmado)
- persistencia o validación
- expiración (ttl)

Y luego adaptar al core mediante `IPasswordResetTokenPort` y `IEmailVerificationTokenPort`.

## ✅ Checklist

- [ ] Implementar `IUserRepositoryPort`
- [ ] Implementar `ICredentialRepositoryPort` (persistencia de sesiones/refresh)
- [ ] Implementar `ITokenServicePort` (access/refresh issue/verify)
- [ ] Implementar `IPasswordResetTokenPort`
- [ ] Implementar `IEmailVerificationTokenPort`
- [ ] Construir contenedor con `AuthServiceFactory.create(...)`

## ⬅️ Anterior

- [`arquitectura`](./architecture.md)

## ➡️ Siguiente

- [Integración Express](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)
