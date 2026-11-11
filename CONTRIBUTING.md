# Contributing to WebSec CTF

Thank you for your interest in contributing to **WebSec CTF**! We welcome contributions from developers, security researchers, and educators.

---

## 1. Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to `security@websec.ctf`.

---

## 2. Ways to Contribute

- **Report Bugs**: Submit bug reports via [GitHub Issues](https://github.com/your-username/websec-ctf/issues).
- **Propose Features**: Suggest enhancements, architectural improvements, or new learning modules.
- **Submit Vulnerable Challenges**: Author practical web security labs aligned with OWASP Top 10, ASVS, and CWE standards.
- **Improve Documentation**: Enhance deployment guides, challenge writeups, and architecture documentation.
- **Code Improvements**: Fix open issues in the React frontend or NestJS backend.

---

## 3. Local Development Setup

Follow our 3-step setup:

```bash
# 1. Clone repository
git clone https://github.com/your-username/websec-ctf.git
cd websec-ctf

# 2. Automated Onboarding (Linux/macOS)
./scripts/setup.sh

# Or on Windows PowerShell:
.\scripts\setup.ps1
```

---

## 4. Submitting a New Challenge

1. Scaffold your challenge container:
   ```bash
   ./scripts/create-challenge.sh "My Challenge Name" "Injection" "Medium" 200
   ```
2. Build and verify the target container:
   ```bash
   cd challenges/<my-challenge-slug>
   docker compose -f docker-compose.challenge.yml up -d --build
   ```
3. Ensure your challenge respects [Zero-Trust Challenge Isolation](challenges/README.md).
4. Fill in `challenge.json` with learning objectives, references (OWASP, CWE), and author solution.
5. Submit a PR titled `challenge: <Challenge Name>`.

---

## 5. Coding Standards & Git Workflow

- **Branch Naming**:
  - `feat/feature-name`
  - `fix/bug-fix`
  - `challenge/challenge-slug`
  - `docs/documentation-update`
- **Frontend Verification**:
  ```bash
  cd frontend
  npm run build
  ```
- **Backend Verification**:
  ```bash
  cd backend
  npm run build
  npm test
  ```
- **Commit Messages**: Follow Conventional Commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
