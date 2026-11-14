# OWASP Top 10, CWE & CVSS Research Matrix

Comprehensive reference guide for web vulnerability classification, severity metrics, and defensive countermeasures in the WebSec CTF ecosystem.

---

## 1. OWASP Top 10 (2021 & 2025) to CWE Taxonomy Mapping

| OWASP Category | Primary CWE IDs | Common Real-World Vulnerability Manifestations | WebSec CTF Target Area |
| :--- | :--- | :--- | :--- |
| **A01: Broken Access Control** | CWE-639, CWE-862, CWE-863, CWE-22, CWE-284 | Insecure Direct Object References (IDOR), Path Traversal, Missing Function-Level Access Control, CORS misconfigurations | Player profile viewing, lab container access, admin panel endpoints |
| **A02: Cryptographic Failures** | CWE-259, CWE-327, CWE-328, CWE-330 | Hardcoded secrets, broken JWT signature verification, weak hashing (MD5/SHA1), predictable tokens | Flag signing keys, session tokens, password storage |
| **A03: Injection** | CWE-89, CWE-78, CWE-79, CWE-94, CWE-917 | SQL Injection (SQLi), Command Injection, Cross-Site Scripting (XSS), Expression Language Injection | Search filters, dynamic query builders, shell executor labs |
| **A04: Insecure Design** | CWE-209, CWE-311, CWE-522, CWE-602 | Client-side trust vulnerabilities, missing rate limiting on business flows, unauthenticated state transitions | Flag submission rate limits, score recalculation |
| **A05: Security Misconfiguration** | CWE-16, CWE-200, CWE-209, CWE-1004 | Default credentials, verbose error stack traces, exposed directory listings, missing security headers | Lab web servers, Swagger docs in production, Docker headers |
| **A06: Vulnerable & Outdated Components** | CWE-1104, CWE-937 | Unpatched third-party npm packages, CVEs in underlying base Docker images | Challenge target runtime containers |
| **A07: Identification & Auth Failures** | CWE-287, CWE-384, CWE-613, CWE-640 | Credential stuffing, weak password policies, session fixation, unvalidated password resets | User login, invitation token acceptance, session timeouts |
| **A08: Software & Data Integrity Failures** | CWE-502, CWE-494 | Insecure deserialization, untrusted package sources, unsigned mobile/web assets | Object deserialization challenges |
| **A09: Security Logging & Monitoring Failures** | CWE-778, CWE-117 | Missing audit logs for privilege escalation, log injection, unmonitored failed auth | Platform audit logs, admin management actions |
| **A10: Server-Side Request Forgery (SSRF)** | CWE-918 | Unrestricted internal IP requests (`127.0.0.1`, `169.254.169.254`, Docker private subnets) | Webhook preview features, URL fetcher challenges |

---

## 2. OWASP ASVS v4.0 Verification Levels

- **Level 1 (Opportunistic):** Essential controls testable via automated black-box tools.
- **Level 2 (Standard):** Defends against most threats targeting applications handling sensitive business data. **WebSec CTF Core Platform enforces Level 2.**
- **Level 3 (Advanced):** High-assurance systems defending against advanced persistent threats (critical infrastructure, financial core).

---

## 3. CVSS v3.1 Scoring Vectors Quick Reference

Base Score Metrics:
- **Attack Vector (AV):** Network (`N`, 0.85), Adjacent (`A`, 0.62), Local (`L`, 0.55), Physical (`P`, 0.20)
- **Attack Complexity (AC):** Low (`L`, 0.77), High (`H`, 0.44)
- **Privileges Required (PR):** None (`N`, 0.85), Low (`L`, 0.62 / 0.68), High (`H`, 0.27 / 0.50)
- **User Interaction (UI):** None (`N`, 0.85), Required (`R`, 0.62)
- **Scope (S):** Unchanged (`U`), Changed (`C`)
- **Confidentiality (C), Integrity (I), Availability (A):** None (`N`, 0.0), Low (`L`, 0.22), High (`H`, 0.56)

Severity Tiers:
- **None:** 0.0
- **Low:** 0.1 – 3.9
- **Medium:** 4.0 – 6.9
- **High:** 7.0 – 8.9
- **Critical:** 9.0 – 10.0

---

## 4. Evidence Verification Checklist

1. **Deterministic Reproduction:** Can the flaw be triggered reliably with an exact HTTP request?
2. **Environmental Boundary:** Does the exploit affect only the vulnerable challenge container, or does it breach the host/database?
3. **Defense-in-Depth:**
   - Primary Fix: Eliminates the root cause (e.g., parameterized query).
   - Secondary Fix: Mitigates impact if primary fails (e.g., least-privilege DB role, CSP).
