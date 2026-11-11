# Challenge Name

## Description
Provide a concise overview of the target web application, simulated user roles, and the security problem.

## Objectives
- [ ] Discover the vulnerable input parameter or endpoint.
- [ ] Understand why input validation or access control failed.
- [ ] Capture the flag formatted as `WEBSEC{...}`.

## Vulnerability Details
- **Category**: Injection / Broken Access Control / etc.
- **OWASP Reference**: e.g., A03:2021-Injection
- **CWE**: e.g., CWE-89

## Exploitation Walkthrough (Author Solution)
1. Send an HTTP GET request to `/`.
2. Inspect headers or source code.
3. Pass header `X-Admin-Token: admin_secret_token_bypass` to `/api/flag`.
4. Capture flag `WEBSEC{sample_flag_proof_of_concept_2026}`.

## Remediation
Explain how to properly secure this vulnerability (e.g. prepared statements, server-side authorization checks).
