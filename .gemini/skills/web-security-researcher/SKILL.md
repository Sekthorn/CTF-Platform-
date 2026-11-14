---
name: web-security-researcher
description: Researches real-world web vulnerabilities and security standards (OWASP Top 10, WSTG, ASVS, API Security, CWE, CVE, CVSS, PortSwigger Web Security Academy). Use when investigating vulnerability mechanics, CVE advisories, attack vectors, or writing deep-dive remediation and root-cause explanations.
---

# Web Security Researcher

Authoritative, evidence-based research runbook for web vulnerabilities, exploitation mechanics, and defensive remediations in the WebSec CTF platform.

---

## 1. Activation Conditions
Activate this skill when:
- Investigating specific vulnerability mechanics or recent CVE disclosures.
- Mapping challenges or code flaws to OWASP (Top 10, WSTG, ASVS, API Security), CWE IDs, and CVSS scores.
- Writing or reviewing root-cause analyses, exploit walkthroughs, or defense tutorials in the Security Knowledge Library.
- Formulating realistic test payloads for vulnerable application scenarios.

---

## 2. Core Workflow

```
1. Scope & Classify ──> 2. Vector Analysis ──> 3. Verify Evidence ──> 4. Root Cause ──> 5. Defend & Document
```

### Step 1: Vulnerability Classification & Scoping
1. Map the target flaw to its exact **CWE ID** and **OWASP Top 10 / ASVS** category using the [OWASP-CWE Matrix](./references/owasp-cwe-matrix.md).
2. Calculate the CVSS v3.1 base score using `scripts/cvss_calculator.py`.

### Step 2: Mechanics & Attack Vector Analysis
1. Trace the input vector (URL parameter, HTTP header, request body, cookie, JWT claim).
2. Identify the vulnerable sink (e.g., `eval()`, raw SQL concatenation, `child_process.exec()`, unsafe XML/YAML parser, unvalidated redirect).
3. Document prerequisite conditions (e.g., unauthenticated, player role, specific header).

### Step 3: Evidence Verification
1. Distinguish verified facts from assumptions. Confirm against official RFCs, vendor specs, or reputable advisories.
2. Formulate safe, representative proof-of-concept HTTP requests and responses.

### Step 4: Root-Cause Analysis
1. Explain *why* the vulnerability exists at the architectural and code levels (e.g., lack of parameterized queries, missing server-side authorization check, trusting client-side state).

### Step 5: Defensive Remediation
1. Define primary remediation (e.g., parameterized statements, strict schema validation, cryptographically verified tokens).
2. Define secondary defense-in-depth controls (e.g., Content Security Policy, least-privilege DB role, egress filtering).
3. Format output using the [Vulnerability Report Template](./assets/vulnerability_report_template.md).

---

## 3. Supporting Resources (Level 3)

- **Taxonomy & Standards Reference:** [references/owasp-cwe-matrix.md](./references/owasp-cwe-matrix.md)
- **CVSS v3.1 Scoring Script:** `python .agents/skills/web-security-researcher/scripts/cvss_calculator.py <VECTOR>`
- **Output Report Template:** [assets/vulnerability_report_template.md](./assets/vulnerability_report_template.md)
