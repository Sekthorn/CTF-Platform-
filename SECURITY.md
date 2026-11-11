# Security Policy

## 1. Supported Versions

We release security patches for the current major version.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 2. Platform Security vs. Challenge Vulnerabilities

Please understand the fundamental distinction between:

1. **Main Platform Infrastructure** (`backend/`, `frontend/`, `infrastructure/`, `scripts/`):
   - The main WebSec CTF platform is intended to be **strictly secure, robust, and hardened**.
   - Vulnerabilities in authentication, authorization, session management, input handling, or container escape flaws in the core platform are critical security bugs.
2. **Challenge Labs** (`challenges/`):
   - Challenge targets are **intentionally vulnerable** by design for pedagogical and training purposes.
   - Intended vulnerabilities in challenge targets are not platform security flaws.
   - However, if a challenge container allows host escape, access to the production database, or unintended denial-of-service against the host machine, that is treated as a security issue.

---

## 3. Reporting a Vulnerability

If you discover a security vulnerability in the WebSec CTF platform, please follow responsible disclosure principles:

- **DO NOT** create public GitHub issues or discussions for sensitive security bugs.
- **Email** your vulnerability report directly to: **security@websec.ctf**
- Include detailed reproduction steps, proof-of-concept payloads, and potential remediation suggestions.

### Our Commitment:
- **Acknowledgement**: Within 48 hours of receipt.
- **Triage & Remediation Plan**: Within 7 business days.
- **Credit**: Coordinated public advisory and Hall of Fame attribution upon release of the fix.
