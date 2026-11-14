# Secure Code Review Checklist (OWASP ASVS & WebSec CTF Standards)

Standardized audit criteria for inspecting React frontend, NestJS backend, and Prisma ORM database interactions.

---

## 1. Authentication & Session Management
- [ ] **Password Storage:** Passwords hashed with bcrypt (cost factor $\ge 10$) or Argon2id. Cleartext passwords never logged or stored.
- [ ] **JWT Handling:**
  - Secrets loaded strictly from environment variables (e.g., `process.env.JWT_SECRET`).
  - Strict algorithm verification (disallow `none` or asymmetric/symmetric confusion).
  - Reasonable expiration time (`expiresIn: '1h'` or `7d` with refresh token rotation).
- [ ] **Brute Force & Rate Limiting:** Sensitive endpoints (`/auth/login`, `/auth/register`, `/challenges/submit-flag`) protected by rate limits.

---

## 2. Authorization & Access Control (IDOR Prevention)
- [ ] **Server-Side Verification:** Never trust client-supplied user IDs from request parameters (`req.params.userId`). Always bind authorization checks to `req.user.id` extracted from verified JWTs.
- [ ] **Role-Based Access Control:** Admin endpoints guarded by `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('ADMIN')`.
- [ ] **Object Ownership Verification:** Ensure Prisma queries filter by both target ID AND owner ID:
  ```typescript
  // Secure ownership check
  const lab = await prisma.userLabInstance.findFirst({
    where: { id: labId, userId: req.user.id }
  });
  ```

---

## 3. Data Validation & Injection Prevention
- [ ] **Prisma ORM Queries:**
  - Avoid `$queryRawUnsafe` with string concatenation.
  - If `$queryRaw` is necessary, use parameterized tagged template literals (`Prisma.sql`).
- [ ] **DTO Validation:**
  - All NestJS incoming controller payloads validated via `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
  - Class-validator decorators applied to all DTO properties (`@IsString()`, `@IsEmail()`, `@Length()`).
- [ ] **Frontend Output Sanitization:**
  - Avoid `dangerouslySetInnerHTML` unless input is thoroughly sanitized with DOMPurify.
  - Avoid dynamic `href="javascript:..."` evaluation.

---

## 4. Sensitive Information & Secrets Exposure
- [ ] No hardcoded database credentials, API keys, or JWT secrets in code or git history.
- [ ] Flags never exposed in frontend bundles, public API responses, or static JavaScript files.
- [ ] Error messages returned to clients do not leak database stack traces, SQL errors, or internal file system paths.
