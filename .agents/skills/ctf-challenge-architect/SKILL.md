---
name: ctf-challenge-architect
description: Designs and implements isolated, realistic web application penetration testing CTF challenges across Beginner, Easy, Medium, and Hard difficulty tiers. Use when creating new challenge scenarios, implementing per-player dynamic flag mechanisms, writing hints, or configuring isolated target environments.
---

# CTF Challenge Architect

Authoritative engineering runbook for designing, packaging, and deploying realistic web penetration testing challenges on the WebSec CTF platform.

---

## 1. Activation Conditions
Activate this skill when:
- Designing new web penetration testing challenge scenarios across any difficulty tier.
- Formulating per-player dynamic flag algorithms and validation endpoints.
- Crafting progressive hint ladders with point deductions.
- Authoring deep-dive educational learning materials and solution guides.
- Verifying container security boundaries and challenge isolation.

---

## 2. Core Workflow

```
1. Scenario Design ──> 2. Tier Classification ──> 3. Dynamic Flagging ──> 4. Container Isolation ──> 5. Hints & Curriculum ──> 6. Verify Solvability
```

### Step 1: Realistic Scenario Formulation
1. Select the target vulnerability topic (OWASP Top 10, CWE).
2. Base the challenge on a realistic enterprise web application context (e.g., e-commerce, banking portal, medical record system, admin dashboard), avoiding artificial puzzle mechanics.

### Step 2: Difficulty Tier Alignment
1. Calibrate exploit complexity against the [Difficulty Guidelines](./references/challenge-difficulty-guidelines.md) (Beginner, Easy, Medium, Hard).

### Step 3: Dynamic Flagging Mechanism
1. Implement per-player flags using deterministic HMAC-SHA256 signatures via `scripts/generate_challenge_flag.py`.
2. Ensure flags and scoring logic remain strictly on the backend. Never hardcode flags in frontend assets or container images.

### Step 4: Container Isolation & Hardening
1. Configure isolated Docker Compose networks for the target environment.
2. Verify security boundaries: read-only filesystem, CPU/RAM caps, no Docker socket mounting, no access to production MySQL.

### Step 5: Educational Materials & Hint Ladder
1. Write 1 to 3 progressive hints with defined point penalties.
2. Complete the comprehensive [Challenge Manifest Template](./assets/challenge_manifest_template.md).

### Step 6: Solvability Verification
1. Walk through the challenge from an unauthenticated student perspective.
2. Confirm the exploit path works deterministically and the dynamic flag submits and scores successfully.

---

## 3. Supporting Resources (Level 3)

- **Difficulty Rubric & Isolation Rules:** [references/challenge-difficulty-guidelines.md](./references/challenge-difficulty-guidelines.md)
- **Dynamic Flag Script:** `python .agents/skills/ctf-challenge-architect/scripts/generate_challenge_flag.py generate --slug <SLUG> --player-id <PLAYER>`
- **Challenge Manifest Template:** [assets/challenge_manifest_template.md](./assets/challenge_manifest_template.md)
