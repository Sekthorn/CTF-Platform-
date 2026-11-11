# Vulnerable Challenge Authoring Guide

This guide describes how to design, package, and contribute secure vulnerable web challenges to **WebSec CTF**.

---

## 1. Challenge Lifecycle

```
[ Idea / Vulnerability ] 
         │
         ▼
[ Run Scaffolding Helper ] ────> ./scripts/create-challenge.sh
         │
         ▼
[ Develop Vulnerable App ] ────> app.py / index.js / Dockerfile
         │
         ▼
[ Define Metadata & Flag ] ────> challenge.json
         │
         ▼
[ Test & Verify Locally ]  ────> docker compose -f docker-compose.challenge.yml up -d
         │
         ▼
[ Submit Pull Request ]    ────> PR Template with author walkthrough
```

---

## 2. Directory Structure

Each challenge lives inside `challenges/<challenge-slug>/`:

```
challenges/sql-injection-auth/
├── challenge.json              # Standardized metadata
├── Dockerfile                  # Hardened container definition
├── docker-compose.challenge.yml# Local sandbox runner
├── README.md                   # Exploitation writeup & author solution
├── requirements.txt            # Python dependencies (or package.json)
└── app.py                      # Vulnerable application code
```

---

## 3. Metadata Specification (`challenge.json`)

```json
{
  "title": "SQL Injection Authentication Bypass",
  "slug": "sql-injection-auth-bypass",
  "category": "Injection",
  "difficulty": "Easy",
  "points": 100,
  "shortDescription": "Bypass login authentication by injecting raw SQL into username parameter.",
  "flags": [
    {
      "flag": "WEBSEC{sqli_bypass_admin_auth_success}",
      "isCaseSensitive": true
    }
  ],
  "hints": [
    {
      "order": 1,
      "title": "Query Structure",
      "costPoints": 0,
      "content": "Look at how the SQL query concatenates user input: SELECT * FROM users WHERE username = '...' AND password = '...'"
    }
  ],
  "references": [
    {
      "referenceType": "OWASP_TOP_10",
      "identifier": "A03:2021"
    },
    {
      "referenceType": "CWE",
      "identifier": "CWE-89"
    }
  ]
}
```

---

## 4. Hardening Requirements for Challenge Targets

1. **Non-root execution**: Always add and switch to an unprivileged user (`ctfuser`).
2. **Resource limits**: Cap CPU at `0.5` and memory at `256M`.
3. **Drop Capabilities**: Use `cap_drop: [ALL]` and `no-new-privileges: true` in Compose.
4. **Read-only Flag**: Set `/flag.txt` permissions to `444` (read-only for ctfuser).
