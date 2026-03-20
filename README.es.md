# @jmlq/auth 🧩

## 🎯 Objetivo

`@jmlq/auth` es un **core de autenticación** (no un framework) diseñado con **Clean Architecture** para centralizar:

- Casos de uso de autenticación (registro, login, refresh, logout)
- Flujos de seguridad de contraseña (remember/reset/change)
- Contratos (ports) para persistencia, hashing y servicios de tokens

El paquete **no expone endpoints HTTP** y está pensado para integrarse desde un host (por ejemplo Express) mediante adapters.

## ⭐ Importancia

- Evita “auth ad‑hoc” por cada API: el **core concentra reglas y casos de uso**.
- Fuerza separación de responsabilidades: dominio fuerte + infraestructura intercambiable.
- Habilita sesiones multi‑dispositivo (vía `sessionId/sid`) y rotación/revocación (refresh).

## 🏗️ Arquitectura (visión rápida)

- Punto de entrada: `AuthServiceFactory.create(...)` construye el contenedor de Auth y evita wiring repetido.
- La sesión se orquesta con `TokenSessionService` (rotación/revocación).
- El hashing de contraseñas se implementa con `BcryptPasswordHasher`.

➡️ Ver detalle en: [architecture.md](./docs/es/architecture.md)

## 🔧 Implementación

### 5.1 Instalación

```bash
npm i @jmlq/auth
```

### 5.2 Dependencias

Dependencia directa del paquete:

- `bcryptjs`

(El host aporta el resto: repositorios, tokens, transporte HTTP, etc.)

### 5.3 Quickstart (implementación rápida)

En un host, la construcción del contenedor se realiza en el composition root (ej. infrastructure/bootstrap):

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
    // opcional:
    // passwordResetTokenTtl: "30m",
    // emailVerificationTokenTtl: "1d",
  },
);
```

### 5.4 Variables de entorno (.env) 📦

`@jmlq/auth` no usa `.env` internamente; el host (API) define su configuración y luego construye adapters.

En el `host` se sugiere declarar variables relacionadas con cookies/headers y generación de links empleados en las funcionalidades de registro y autentificación, por ejemplo:

```ts
process.env.AUTH_COOKIE_NAME; // => envs.auth.COOKIE_NAME
process.env.AUTH_FRONTEND_BASE_URL; // => envs.auth.FRONTEND_BASE_URL
process.env.AUTH_FRONTEND_RESET_PASSWORD_PATH; // => envs.auth.FRONTEND_RESET_PASSWORD_PATH

process.env.AUTH_LINK_API_BASE_URL; // => envs.auth.LINK_API_BASE_URL
process.env.AUTH_LINK_API_VERIFY_EMAIL_PATH; // => envs.auth.LINK_API_VERIFY_EMAIL_PATH
```

> Nota: los nombres exactos de las variables `.env` dependen de tu módulo `envs` (host).

### 5.5 Helpers y funcionalidades clave

#### ✅ Validaciones HTTP en el host (Express)

En `host` se pueden aplicar validaciones explícitas antes de delegar al core. Por ejemplo:

- **change-password**: garantiza que `newPassword` sea diferente a `currentPassword` y que coincida con `confirmNewPassword`.
- **refresh**: obtiene refresh token desde cookie y como fallback desde header.
- **logout**: es opcional; si no hay refresh token, se limpia cookie y se responde ok.

#### ✅ Headers estándar (fallback de refresh token)

En `host` el header para refresh puede usar el nombre derivado de `envs.auth.COOKIE_NAME`:

- `X-${envs.auth.COOKIE_NAME}`

#### ✅ Generación de links de Password Reset y Verify Email

El `host` genera links combinando `base + path` y parametriza el token con `URL.searchParams`:

- Reset password: `{FRONTEND_BASE_URL}{FRONTEND_RESET_PASSWORD_PATH}?token=...`
- Verify email: `{LINK_API_BASE_URL}{LINK_API_VERIFY_EMAIL_PATH}?token=...`

## ✅ Checklist (pasos rápidos)

- [Instalar](#51-instalación)
- [Implementar ports en tu host](./docs/es/configuration.md#ports-que-tu-host-debe-implementar)
- [Construir el contenedor con AuthServiceFactory](./docs/es/configuration.md#construcción-del-contenedor-authservicefactorycreate)
- [Integrar con Express](./docs/es/integration-express.md)
- [Configurar headers/cookies y links](./docs/es/integration-express.md#refresh-token-cookie--header-fallback)
- [Troubleshooting](./docs/es/troubleshooting.md)

## 📌 Menú

- [Arquitectura](./docs/architecture.md)
- [Configuración](./docs/es/configuration.md)
- [Integración Express](./docs/es/integration-express.md)
- [Troubleshooting](./docs/es/troubleshooting.md)

## 🔗 Referencias

- [`@jmlq/auth-plugin-jose`](../auth-plugin-jose/README.md)

- [`@jmlq/auth`](https://github.com/MLahuasi/jmlq-auth#readme)
- Plugins relacionados del ecosistema:
  - [`@jmlq/auth-plugin-jose`](https://github.com/MLahuasi/jmlq-auth-plugin-jose#readme)

## ⬅️ 🌐 Ecosistema

- [`@jmlq`](https://github.com/MLahuasi/jmlq-ecosystem#readme)
