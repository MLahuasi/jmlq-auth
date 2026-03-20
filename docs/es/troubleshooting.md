# Troubleshooting — @jmlq/auth 🩺

## 🎯 Objetivo

Resolver problemas comunes al integrar `@jmlq/auth` en un host (Express u otro), basados en el comportamiento real del host `ml-dev-rest-api`.

## 1) Change password retorna “Passwords do not match”

En el host, antes de llamar al core, existe una validación:

- Si `newPassword !== confirmNewPassword` ⇒ error `Passwords do not match`.

Checklist:

- Verifica que `confirmNewPassword` sea exactamente igual a `newPassword`.
- Verifica trims / espacios accidentalmente introducidos en el cliente.

## 2) Change password retorna “New password must be different from currentPassword”

Validación real en el host:

- Si `newPassword === currentPassword` ⇒ error.

Checklist:

- Asegura que el cliente no esté reutilizando el mismo valor (por auto‑relleno, por ejemplo).

## 3) Refresh falla por “missing refresh token”

En el host hay dos fuentes posibles:

- Cookie
- Header fallback: `X-${envs.auth.COOKIE_NAME}`

Checklist:

- Confirma que el cliente está enviando cookie (si usas cookies).
- Si NO usas cookies, envía el header `X-${COOKIE_NAME}: <refreshToken>`.

## 4) Logout sin refresh token (comportamiento esperado)

En el host, logout es **opcional**:

- si no hay refresh token, igual se limpia cookie y se responde ok.

Checklist:

- Si necesitas logout “estricto”, debes cambiar el comportamiento del host (no del core).

## ✅ Checklist

- [ ] Verificar `newPassword` vs `confirmNewPassword`
- [ ] Verificar `newPassword` != `currentPassword`
- [ ] Refresh: cookie o header `X-${envs.auth.COOKIE_NAME}`
- [ ] Entender logout opcional del host

---

## ⬅️ Anterior

- [`arquitectura`](./architecture.md)

## ➡️ Siguiente

- [Configuración](./configuration.md)
- [Integración Express](./integration-express.md)
