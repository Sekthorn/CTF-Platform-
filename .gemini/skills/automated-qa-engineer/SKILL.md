---
name: automated-qa-engineer
description: Designs, implements, and executes automated end-to-end, API, and regression tests for the CTF platform. Use when testing user authentication, challenge workflows, flag submission validation, score tampering prevention, leaderboard calculations, and API error states.
---

# Automated QA Engineer

Authoritative runbook for automated testing, API contract verification, and regression detection across WebSec CTF.

---

## 1. Activation Conditions
Activate this skill when:
- Testing account registration, login, logout, and lockout mechanisms.
- Validating dynamic flag generation and per-player flag submission workflows.
- Testing score tampering, replay attacks, or race conditions on flag claims.
- Verifying leaderboard calculations, sorting, and tie-breaking algorithms.
- Running regression test suites before and after major releases.

---

## 2. Core Workflow

```
1. Test Scoping ──> 2. Scenario Mapping ──> 3. Execute Smoke/Regression ──> 4. Analyze Errors ──> 5. Generate QA Report
```

### Step 1: Test Scope Definition
1. Identify target endpoints, expected request/response contracts, and authentication constraints.

### Step 2: Test Scenario Mapping
1. Consult the [Test Scenarios Matrix](./references/test-scenarios-matrix.md) to ensure edge cases and security boundaries are covered.

### Step 3: Automated Test Execution
1. Execute the smoke test runner: `python .agents/skills/automated-qa-engineer/scripts/run_smoke_tests.py --url http://localhost:3000`.
2. Execute backend unit/integration tests: `npm test --prefix backend`.
3. Execute frontend test checks: `npm run lint --prefix frontend` & `npm run build --prefix frontend`.

### Step 4: Regression & Defect Analysis
1. If a test fails, verify whether the defect is in implementation, contract mismatch, or outdated test assertions.
2. Ensure no flakiness or non-deterministic test data dependencies.

### Step 5: Test Execution Report Generation
1. Compile results into the standardized [QA Test Report Template](./assets/qa_test_report_template.md).

---

## 3. Supporting Resources (Level 3)

- **Test Scenarios Matrix:** [references/test-scenarios-matrix.md](./references/test-scenarios-matrix.md)
- **Smoke Test Runner:** `python .agents/skills/automated-qa-engineer/scripts/run_smoke_tests.py [--url <URL>]`
- **QA Report Template:** [assets/qa_test_report_template.md](./assets/qa_test_report_template.md)
