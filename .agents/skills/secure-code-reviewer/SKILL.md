---
name: secure-code-reviewer
description: Performs security-focused static code analysis and architectural reviews on frontend and backend code. Use when auditing pull requests, reviewing authentication/authorization logic, identifying OWASP vulnerabilities, detecting IDOR, or checking input validation and data exposure.
---

# Secure Code Reviewer

Authoritative code review runbook for detecting vulnerabilities, verifying authentication/authorization boundaries, and ensuring OWASP ASVS Level 2 compliance in WebSec CTF.

---

## 1. Activation Conditions
Activate this skill when:
- Reviewing pull requests, patches, or newly created features before merging.
- Auditing authentication, session lifecycle, password reset, or invitation acceptance code.
- Checking API endpoints for IDOR, Missing Function-Level Access Control, or unvalidated inputs.
- Verifying database queries (Prisma ORM) to prevent SQL injection or data leaks.
- Checking React frontend components for client-side flag storage, XSS, or secret exposure.

---

## 2. Core Workflow

```
1. Scope Review ──> 2. Automated Static Scan ──> 3. Taint & Data Flow ──> 4. Auth & IDOR Check ──> 5. Generate Finding Report
```

### Step 1: Scope Definition
1. Identify all modified files, API endpoints, DTO contracts, and Prisma database schema definitions.

### Step 2: Automated Static Pattern Scanning
1. Run `python .agents/skills/secure-code-reviewer/scripts/static_security_check.py <TARGET_DIR>` to detect dangerous sinks (`dangerouslySetInnerHTML`, `$queryRawUnsafe`, `eval`, hardcoded secrets).

### Step 3: Taint & Input Flow Tracking
1. Follow user input from controller DTOs down to database queries or operating system commands.
2. Confirm class-validator decorators are applied and whitelisting is active in NestJS `ValidationPipe`.

### Step 4: Authentication & Authorization (IDOR) Verification
1. Check against the [Security Review Checklist](./references/security-review-checklist.md).
2. Verify that object IDs in parameters are checked against the authenticated `req.user.id`.

### Step 5: Finding Documentation & Remediation
1. Distinguish verified exploitable flaws from theoretical warnings.
2. Structure every finding using the [Finding Report Template](./assets/finding_report_template.md).

---

## 3. Supporting Resources (Level 3)

- **Comprehensive Checklist:** [references/security-review-checklist.md](./references/security-review-checklist.md)
- **Static Security Scanner:** `python .agents/skills/secure-code-reviewer/scripts/static_security_check.py [TARGET_PATH]`
- **Report Template:** [assets/finding_report_template.md](./assets/finding_report_template.md)
