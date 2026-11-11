# WebSec CTF — Admin-Only Authentication & Single Sign-On (SSO)

## 1. Authentication Policy Overview

**WebSec CTF operates under a strict Admin-Only security model.**

- **No Public Registration**: Self-registration endpoints for public users are completely disabled.
- **Admin Access Only**: Only verified administrators with `role === ADMIN` and active status can sign in.
- **Controlled Provisioning**: New administrator accounts can only be provisioned via:
  1. **Method A: Initial Administrator Setup** (`/admin/setup`) — Gated by a server setup secret; permanently disabled after the first admin is created.
  2. **Method B: Protected Administrator Invitations** (`/admin/accept-invitation`) — Existing authorized administrators generate single-use, cryptographically secure invitation links.
- **Backend Authorization Enforcement**: All administrative routes and APIs verify permissions server-side using NestJS `JwtAuthGuard` and `RolesGuard`.
- **Enumeration Defenses**: Authentication errors return strictly generic responses (`"Invalid credentials"`) to prevent username or email discovery.

---

## 2. Administrator Provisioning Workflows

### Method A: Initial Administrator Setup

When installing WebSec CTF for the first time:

1. The platform checks `GET /api/v1/auth/setup-status`.
2. If `adminCount === 0`, setup is permitted at `/admin/setup`.
3. The technician supplies:
   - `Setup Secret`: Must match `SETUP_SECRET` configured in server `.env`.
   - `Username`: Minimum 3 characters, alphanumeric.
   - `Email`: Unique valid corporate address.
   - `Password`: Minimum 8 characters with uppercase, lowercase, and numbers/symbols.
4. **Permanent Lock**: Once the root administrator is created, subsequent requests to `/api/v1/auth/initial-setup` are rejected with `403 Forbidden`.

```bash
# Server configuration (.env)
SETUP_SECRET=your_high_entropy_setup_secret_here
```

---

### Method B: Administrator Invitation Workflow

After initial bootstrap, existing administrators invite new staff:

1. **Invite Creation** (`POST /api/v1/admins/invitations`):
   - Authenticated admin supplies the invitee's email.
   - The backend generates a 48-byte cryptographically secure token (`crypto.randomBytes(48).toString('hex')`).
   - Only the SHA-256 hash of the token is persisted in the `admin_invitations` MySQL table with a 48-hour expiration.
   - The system outputs a unique invitation link:
     ```
     https://your-domain.com/admin/accept-invitation?token=<random_token>
     ```
2. **Acceptance** (`POST /api/v1/auth/invitations/accept`):
   - The invitee visits the link, which validates the token hash against MySQL.
   - The invitee selects their username and strong password.
   - The transaction creates the new administrator account and records `usedAt = NOW()`.
3. **Anti-Replay & Revocation**:
   - Single-use only: invitations cannot be accepted twice.
   - Admins can revoke pending invitations at any time via `DELETE /api/v1/admins/invitations/:id`.

---

## 3. Centralized Single Sign-On (SSO) & Session Architecture

WebSec CTF implements centralized session management:

```
[ Browser / Admin Client ]
       │
       │  1. POST /api/v1/auth/login (identifier + password)
       ▼
[ NestJS Authentication Gateway ]
       │
       │  2. Verify bcrypt hash (work factor 12) & role == ADMIN
       │  3. Persist sessionHash in MySQL `admin_sessions`
       │  4. Set HttpOnly, Secure, SameSite=Lax cookie (`websec_session`)
       │     + Return JWT access token
       ▼
[ Centralized SSO Session Active ]
       │
       ├──► /admin/dashboard
       ├──► /admin/challenges (50 Challenges Catalog)
       ├──► /admin/labs (Ports 8081-8085)
       ├──► /admin/admins (Account Management & Invites)
       └──► /admin/audit-logs (Security Trail)
```

### Session Attributes
- **HttpOnly Cookie**: Prevents JavaScript XSS access to the session token.
- **SameSite Protection**: Set to `Lax` to protect against CSRF attacks.
- **Secure Flag**: Automatically enabled in production (`COOKIE_SECURE=true` or behind HTTPS reverse proxy).
- **Session Revocation**: When an administrator logs out or is suspended, their session records in `admin_sessions` are updated with `isRevoked: true`, immediately terminating access across all browser windows.

---

## 4. Administrator Management & Safeguards

The **Admin Management Console** (`/admin/admins`) provides:

| Feature | Description |
|---|---|
| **Admin List** | View all administrators, active statuses, creation dates, and last login timestamps. |
| **Invite Admin** | Generate single-use invitation links with 48h expiration. |
| **Pending Invites** | Table of pending invites with 1-click revocation. |
| **Account Suspension** | Suspend compromised or deactivated administrator accounts. |
| **Self-Lockout Safeguard** | Admins cannot suspend their own account. |
| **Last-Admin Safeguard** | The system prevents deactivating or suspending the last active administrator. |

---

## 5. Security Audit Logging

All administrative, authentication, and provisioning events are written to the `audit_logs` table:

- `INITIAL_ADMIN_SETUP_SUCCESS`
- `LOGIN_SUCCESS` / `LOGIN_FAILED` / `LOGIN_REJECTED_NON_ADMIN` / `LOGIN_REJECTED_SUSPENDED`
- `LOGOUT`
- `ADMIN_INVITATION_CREATED` / `ADMIN_INVITATION_REVOKED` / `ADMIN_INVITATION_ACCEPTED`
- `ADMIN_ACCOUNT_ACTIVATED` / `ADMIN_ACCOUNT_SUSPENDED`
- `PASSWORD_RESET_REQUESTED` / `PASSWORD_RESET_COMPLETED`

Each entry logs the actor user ID, IP address, user-agent, action name, and JSON details.

---

## 6. API Reference Summary

### Authentication Endpoints
- `GET /api/v1/auth/setup-status` — Check if initial setup is needed
- `POST /api/v1/auth/initial-setup` — Provision root administrator
- `POST /api/v1/auth/login` — Administrator sign-in (rate-limited)
- `POST /api/v1/auth/logout` — Revoke session & clear cookies
- `GET /api/v1/auth/me` — Retrieve verified admin profile
- `GET /api/v1/auth/invitations/:token` — Validate invitation token
- `POST /api/v1/auth/invitations/accept` — Accept invitation and choose credentials
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password` — Complete password reset

### Admin Management Endpoints (`Roles('ADMIN')`)
- `GET /api/v1/admins` — List all administrators
- `POST /api/v1/admins/invitations` — Generate single-use invitation
- `GET /api/v1/admins/invitations` — List all invitations
- `DELETE /api/v1/admins/invitations/:id` — Revoke pending invitation
- `PATCH /api/v1/admins/:id/status` — Activate/suspend administrator
- `GET /api/v1/admins/audit-logs` — Paginated audit log records
