# Challenge Specification Manifest: {{CHALLENGE_TITLE}}

- **Slug:** `{{CHALLENGE_SLUG}}`
- **Category:** `{{CATEGORY}}` (e.g., SQL Injection, Authentication, IDOR, SSRF, XSS)
- **Difficulty:** `{{DIFFICULTY}}` (Beginner | Easy | Medium | Hard)
- **Base Points:** `{{POINTS}}` (e.g., 100, 250, 500)
- **Target CWE:** `CWE-{{CWE_ID}}`

---

## 1. Challenge Overview & Scenario
{{SCENARIO_DESCRIPTION_PARAGRAPH}}

### Objective for Player
{{WHAT_MUST_THE_PLAYER_ACHIEVE_TO_REVEAL_FLAG}}

---

## 2. Dynamic Flag Configuration
- **Type:** Per-Player Dynamic Flag
- **Flag Pattern:** `websec{[a-f0-9]{24}}`
- **Delivery Mechanism:** {{DELIVERY_MECHANISM}} (e.g., HTTP Response Header, Admin Dashboard Page, Injected DB Record)

---

## 3. Progressive Hints
1. **Hint 1 (Reconnaissance - 10% penalty):**
   `{{HINT_1_TEXT}}`
2. **Hint 2 (Concept / Mechanics - 25% penalty):**
   `{{HINT_2_TEXT}}`
3. **Hint 3 (Exploit Direction - 40% penalty):**
   `{{HINT_3_TEXT}}`

---

## 4. Educational Learning Material
- **Why this happens:** {{EXPLANATION}}
- **Real-world incident:** {{CVE_OR_BREACH_EXAMPLE}}
- **Defensive fix:**
```typescript
{{SECURE_CODE_EXAMPLE}}
```

---

## 5. Architectural Isolation Checklist
- [ ] Challenge container runs on isolated Docker bridge network.
- [ ] No access to production database port (3306) or Redis (6379).
- [ ] Resource constraints applied (`cpus: 0.5`, `mem_limit: 256m`).
- [ ] Docker socket (`/var/run/docker.sock`) is NOT mounted.
- [ ] Clean container teardown and state isolation between user sessions.
