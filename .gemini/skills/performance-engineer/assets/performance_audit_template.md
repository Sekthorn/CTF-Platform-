# Performance Optimization Audit: {{MODULE_NAME}}

- **Target Device / Resolution:** Laptop & Desktop ($1366\times 768$ to $1920\times 1080$)
- **Area Audited:** Frontend Rendering / Database Query / API Latency

---

## 1. Measured Baseline Metrics (Before Optimization)
- **Initial JS Bundle Size:** `{{BEFORE_BUNDLE_SIZE_KB}}` kB
- **Page Load / Transition Time:** `{{BEFORE_TRANSITION_MS}}` ms
- **Database Query Latency:** `{{BEFORE_QUERY_MS}}` ms
- **MySQL EXPLAIN Type:** `{{BEFORE_EXPLAIN_TYPE}}` (e.g., `ALL`, `Using filesort`)

---

## 2. Root Cause & Inefficiency Analysis
{{EXPLAIN_WHY_BOTTLENECK_OCCURRED}}

---

## 3. Implemented Optimizations
- **Optimization 1:** {{CODE_SPLITTING_OR_INDEX_OR_MEMOIZATION}}
- **Optimization 2:** {{CSS_CONTAINMENT_OR_QUERY_RESTRUCTURING}}

---

## 4. Post-Optimization Verification (After Optimization)

| Metric | Before | After | Improvement |
| :--- | :--- | :--- | :--- |
| Initial JS Entry Bundle | `{{BEFORE_BUNDLE_SIZE}}` kB | `{{AFTER_BUNDLE_SIZE}}` kB | **-{{BUNDLE_REDUCTION_PCT}}%** |
| Database Query Time | `{{BEFORE_QUERY_TIME}}` ms | `{{AFTER_QUERY_TIME}}` ms | **-{{QUERY_SPEEDUP_PCT}}%** |
| React Component Re-renders | `{{BEFORE_RENDERS}}` | `{{AFTER_RENDERS}}` | Eliminated wasted renders |
| MySQL EXPLAIN Plan | `{{BEFORE_PLAN}}` | `ref` / `range` | Filesort eliminated |

---

## 5. Verification Command Sign-Off
- [ ] Ran `python .agents/skills/performance-engineer/scripts/analyze_bundle.py`
- [ ] Verified responsive layout across laptop viewport widths ($1366\text{px}$, $1440\text{px}$, $1920\text{px}$).
