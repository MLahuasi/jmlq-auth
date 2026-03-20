# Troubleshooting — @jmlq/auth 🩺

## 🎯 Objective

Resolve common issues when integrating `@jmlq/auth` in a host (Express or others), based on the real behavior of the `ml-dev-rest-api` host.

## 1) Change password returns “Passwords do not match”

In the host, before calling the core, there is a validation:

- If `newPassword !== confirmNewPassword` ⇒ error `Passwords do not match`.

Checklist:

- Verify that `confirmNewPassword` is exactly equal to `newPassword`.
- Check trims / spaces accidentally introduced on the client.

## 2) Change password returns “New password must be different from currentPassword”

Real validation in the host:

- If `newPassword === currentPassword` ⇒ error.

Checklist:

- Ensure the client is not reusing the same value (e.g., due to autofill).

## 3) Refresh fails due to “missing refresh token”

In the host there are two possible sources:

- Cookie
- Header fallback: `X-${envs.auth.COOKIE_NAME}`

Checklist:

- Confirm the client is sending the cookie (if you use cookies).
- If you DO NOT use cookies, send the header `X-${COOKIE_NAME}: <refreshToken>`.

## 4) Logout without refresh token (expected behavior)

In the host, logout is **optional**:

- if there is no refresh token, it still clears the cookie and responds ok.

Checklist:

- If you need “strict” logout, you must change the host behavior (not the core).

## ✅ Checklist

- [ ] Verify `newPassword` vs `confirmNewPassword`
- [ ] Verify `newPassword` != `currentPassword`
- [ ] Refresh: cookie or header `X-${envs.auth.COOKIE_NAME}`
- [ ] Understand optional logout behavior in the host

---

## ⬅️ Previous

- [`architecture`](./architecture.md)

## ➡️ Next

- [Configuration](./configuration.md)
- [Express Integration](./integration-express.md)
