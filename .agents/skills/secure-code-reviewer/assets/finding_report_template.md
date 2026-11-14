# Security Code Review Finding: {{FINDING_TITLE}}

- **Severity:** Critical | High | Medium | Low | Informational
- **CVSS v3.1:** `{{CVSS_SCORE}}` (`{{CVSS_VECTOR}}`)
- **CWE Identifier:** `CWE-{{CWE_ID}}` ({{CWE_NAME}})
- **OWASP Category:** {{OWASP_CATEGORY}}
- **Affected Location:** `{{FILE_PATH}}#L{{LINE_NUMBER}}`

---

## 1. Description & Vulnerability Mechanics
{{TECHNICAL_DESCRIPTION_PARAGRAPH}}

---

## 2. Evidence & Vulnerable Code Snippet
```typescript
// {{FILE_PATH}} (Lines {{LINE_START}}-{{LINE_END}})
{{VULNERABLE_CODE_SNIPPET}}
```

---

## 3. Exploit Scenario & Business Impact
{{EXPLOIT_SCENARIO_DESCRIPTION}}
- **Impact on Platform:** {{DATA_LEAK_PRIVILEGE_ESCALATION_OR_CONTAINER_ESCAPE}}

---

## 4. Remediation & Secure Code Refactoring

### Recommended Fix
```typescript
// {{FILE_PATH}} - Refactored Secure Implementation
{{SECURE_CODE_SNIPPET}}
```

### Verification Steps
1. Run `python .agents/skills/secure-code-reviewer/scripts/static_security_check.py` to confirm pattern absence.
2. Run automated regression tests to verify no breaking functional changes.
