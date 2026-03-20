# @jmlq/auth 🧩

## 🎯 Objective

`@jmlq/auth` is an **authentication core** (not a framework) designed with **Clean Architecture** to centralize:

- Authentication use cases (register, login, refresh, logout)
- Password security flows (remember/reset/change)
- Contracts (ports) for persistence, hashing, and token services

This package **does not expose HTTP endpoints** and is intended to be integrated from a host (e.g., Express) via adapters.

## ⭐ Importance

- Avoids “ad-hoc auth” per API: the **core centralizes rules and use cases**
- Enforces separation of responsibilities: strong domain + interchangeable infrastructure
- Enables multi-device sessions (via `sessionId/sid`) and rotation/revocation (refresh)

## 🏗️ Architecture (quick view)

- Entry point: `AuthServiceFactory.create(...)` builds the Auth container and avoids repetitive wiring
- Session orchestration via `TokenSessionService` (rotation/revocation)
- Password hashing implemented with `BcryptPasswordHasher`

➡️ See details in: [architecture.md](./docs/en/architecture.md)

## 🔧 Implementation

### 5.1 Installation

```bash
    npm i @jmlq/auth
```

### 5.2 Dependencies

Direct dependency of the package:

- `bcryptjs`

(The host provides the rest: repositories, tokens, HTTP transport, etc.)

### 5.3 Quickstart (fast implementation)

In a host, the container is built in the composition root (e.g., infrastructure/bootstrap):

```ts
import { AuthServiceFactory } from "@jmlq/auth";

const auth = AuthServiceFactory.create(
  userRepository,
  credentialRepository,
  tokenService,
  passwordResetToken,
  emailVerificationToken,
  {
    bcryptSaltRounds: 10,
    accessTokenTtl: "15m",
    refreshTokenTtl: "7d",
    // optional:
    // passwordResetTokenTtl: "30m",
    // emailVerificationTokenTtl: "1d",
  },
);
```

### 5.4 Environment variables (.env) 📦

`@jmlq/auth` does not use `.env` internally; the host (API) defines its configuration and then builds adapters.

In the `host`, it is recommended to define variables related to cookies/headers and link generation used in registration and authentication flows, for example:

```ts
process.env.AUTH_COOKIE_NAME; // => envs.auth.COOKIE_NAME
process.env.AUTH_FRONTEND_BASE_URL; // => envs.auth.FRONTEND_BASE_URL
process.env.AUTH_FRONTEND_RESET_PASSWORD_PATH; // => envs.auth.FRONTEND_RESET_PASSWORD_PATH

process.env.AUTH_LINK_API_BASE_URL; // => envs.auth.LINK_API_BASE_URL
process.env.AUTH_LINK_API_VERIFY_EMAIL_PATH; // => envs.auth.LINK_API_VERIFY_EMAIL_PATH
```

> Note: exact `.env` variable names depend on your host `envs` module.

### 5.5 Helpers and key features

#### ✅ HTTP validations in the host (Express)

In the `host`, explicit validations can be applied before delegating to the core. For example:

- **change-password**: ensures `newPassword` differs from `currentPassword` and matches `confirmNewPassword`
- **refresh**: retrieves refresh token from cookie and falls back to header
- **logout**: optional; if no refresh token, clear cookie and respond ok

#### ✅ Standard headers (refresh token fallback)

In the `host`, the refresh header can use the name derived from `envs.auth.COOKIE_NAME`:

- `X-${envs.auth.COOKIE_NAME}`

#### ✅ Password Reset and Verify Email link generation

The `host` generates links by combining `base + path` and passing the token via `URL.searchParams`:

- Reset password: `{FRONTEND_BASE_URL}{FRONTEND_RESET_PASSWORD_PATH}?token=...`
- Verify email: `{LINK_API_BASE_URL}{LINK_API_VERIFY_EMAIL_PATH}?token=...`

## ✅ Checklist (quick steps)

- [Install](#51-installation)
- [Implement ports in your host](./docs/en/configuration.md#ports-que-tu-host-debe-implementar)
- [Build container with AuthServiceFactory](./docs/en/configuration.md#construcción-del-contenedor-authservicefactorycreate)
- [Integrate with Express](./docs/en/integration-express.md)
- [Configure headers/cookies and links](./docs/en/integration-express.md#refresh-token-cookie--header-fallback)
- [Troubleshooting](./docs/en/troubleshooting.md)

## 📌 Menu

- [Architecture](./docs/architecture.md)
- [Configuration](./docs/en/configuration.md)
- [Express Integration](./docs/en/integration-express.md)
- [Troubleshooting](./docs/en/troubleshooting.md)

## 🔗 References

- [`@jmlq/auth-plugin-jose`](../auth-plugin-jose/README.md)

- [`@jmlq/auth`](https://github.com/MLahuasi/jmlq-auth#readme)
- Related ecosystem plugins:
  - [`@jmlq/auth-plugin-jose`](https://github.com/MLahuasi/jmlq-auth-plugin-jose#readme)

## ⬅️ 🌐 Ecosystem

- [`@jmlq`](https://github.com/MLahuasi/jmlq-ecosystem#readme)
