# Express Integration — @jmlq/auth 🚏

## 🎯 Objective

Show the real integration of the `@jmlq/auth` core within an Express host, based on `ml-dev-rest-api`.

> The core does not define endpoints or cookies; the host does and delegates to the facade/service exposed in `req.auth`.

## Typical wiring in Express (overview)

1. Build the auth container in infrastructure
2. Attach the facade/service to the request (`req.auth`)
3. Define controllers that:
   - validate the request
   - call `req.auth!...`
   - handle cookies/headers/response

## Real endpoints (ml-dev-rest-api)

Real examples of controller delegation to the `req.auth` service:

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

### Remember (request password reset) + email sending (host)

The host generates the link and uses `req.mailer`:

```ts
const resetLink = buildResetLink(payload.delivery.resetToken);

await req.mailer.send({
  to: { email },
  subject: "Reset password",
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

In the host, the refresh token can come from:

- Cookie (primary)
- Header (fallback)

Actual header name:

```ts
export const AuthHeaderNames = {
  refreshToken: `X-${envs.auth.COOKIE_NAME}`,
  passwordResetToken: "X-Password-Reset-Token",
} as const;
```

Reading the refresh token from header (optional fallback):

```ts
export function getRefreshTokenFromHeader(req: Request): string | null {
  const token = req.header(AuthHeaderNames.refreshToken);
  if (token === undefined) return null;
  // ...
  return token.trim();
}
```

Generating the reset link in the host (safe with URL()):

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

- [ ] Ensure `req.auth` is available in controllers
- [ ] Validate request before delegating (e.g., passwords match / new != current)
- [ ] Implement refresh with cookie + header fallback (`X-${envs.auth.COOKIE_NAME}`)
- [ ] Generate links using `URL()` (reset + verify email)
- [ ] On reset, clear refresh cookie (`clearRefreshTokenCookie(res)`)

---

## ⬅️ Previous

- [`architecture`](./architecture.md)

## ➡️ Next

- [Configuration](./configuration.md)
- [Troubleshooting](./troubleshooting.md)
