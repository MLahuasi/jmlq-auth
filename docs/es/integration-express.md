# Integración con Express — @jmlq/auth 🚏

## 🎯 Objetivo

Mostrar la integración real del core `@jmlq/auth` dentro de un host Express, basada en `ml-dev-rest-api`.

> El core no define endpoints ni cookies; el host lo hace y delega al facade/servicio expuesto en `req.auth`.

## Wiring típico en Express (visión)

1. Construir el contenedor de auth en infrastructure
2. Adjuntar el facade/servicio al request (`req.auth`)
3. Definir controllers que:
   - validan el request
   - llaman a `req.auth!...`
   - manejan cookies/headers/response

## Endpoints reales (ml-dev-rest-api)

Ejemplos reales de delegación del controller al servicio `req.auth`:

### Change password

```ts
const result = await req.auth!.changePassword({
  userId: payload.sub,
  sessionId: payload.sid,
  currentPassword: params.currentPassword,
  newPassword: params.newPassword,
  confirmNewPassword: params.confirmNewPassword,
  logoutAllDevices: params.logoutAllDevices,
});
```

### Remember (request password reset) + envío de email (host)

El host genera el link y usa `req.mailer`:

```ts
const resetLink = buildResetLink(payload.delivery.resetToken);

await req.mailer.send({
  to: { email },
  subject: "Restablecer contraseña",
  templateId: "reset-password",
  templateData: {
    app: envs.APP_NAME,
    resetLink,
    expiresAt: payload.delivery.expiresAt,
  },
});
```

### Reset password

```ts
const result = await req.auth!.resetPassword({
  resetToken: payload.token,
  newPassword: payload.newPassword,
  confirmNewPassword: payload.confirmNewPassword,
  logoutAllDevices: payload.logoutAllDevices ?? true,
});

clearRefreshTokenCookie(res);
```

### Verify email

```ts
const result = await req.auth!.verifyEmail({
  token: payload.tokenRaw.trim(),
});
```

### Me

```ts
const user = await req.auth!.me({ userId: payload.userId });
```

## Refresh token: cookie + header fallback

En el host, el refresh puede venir:

- Cookie (primario)
- Header (fallback)

Nombre del header real:

```ts
export const AuthHeaderNames = {
  refreshToken: `X-${envs.auth.COOKIE_NAME}`,
  passwordResetToken: "X-Password-Reset-Token",
} as const;
```

Lectura del refresh token desde header (fallback opcional):

```ts
export function getRefreshTokenFromHeader(req: Request): string | null {
  const token = req.header(AuthHeaderNames.refreshToken);
  if (token === undefined) return null;
  // ...
  return token.trim();
}
```

Generación del link de reset en el host (seguro con URL()):

```ts
export function buildResetLink(resetToken: string): string {
  const base = envs.auth.FRONTEND_BASE_URL;
  const path = envs.auth.FRONTEND_RESET_PASSWORD_PATH;

  const url = new URL(path, base);
  url.searchParams.set("token", resetToken);

  return url.toString();
}
```

## ✅ Checklist

- [ ] Tener `req.auth` disponible en los controllers
- [ ] Validar request antes de delegar (ej. passwords match / new != current)
- [ ] Implementar refresh con cookie + header fallback (`X-${envs.auth.COOKIE_NAME}`)
- [ ] Generar links con `URL()` (reset + verify email)
- [ ] En reset, limpiar cookie refresh (`clearRefreshTokenCookie(res)`)

---

## ⬅️ Anterior

- [`arquitectura`](./architecture.md)

## ➡️ Siguiente

- [Configuración](./configuration.md)
- [Troubleshooting](./troubleshooting.md)
