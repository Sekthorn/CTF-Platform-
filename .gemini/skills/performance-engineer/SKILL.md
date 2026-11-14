---
name: performance-engineer
description: Profiles, measures, and optimizes frontend rendering, JavaScript bundle sizes, API response times, MySQL database queries, and laptop/desktop resource utilization. Use when diagnosing slow page loads, React re-renders, N+1 queries, missing database indexes, or memory leaks.
---

# Performance Engineer

Authoritative runbook for performance profiling, bundle size minimization, and database query optimization on laptop and desktop environments.

---

## 1. Activation Conditions
Activate this skill when:
- Investigating slow initial page loads, navigation latency, or jank during challenge interaction.
- Auditing JavaScript bundle sizes and CSS payload weights against performance budgets.
- Profiling unnecessary React component re-renders or state thrashing.
- Diagnosing slow MySQL queries, missing indexes, `ALL` full-table scans, or N+1 Prisma query loops.
- Measuring performance impact before and after optimization changes.

---

## 2. Core Workflow

```
1. Baseline Measurement ──> 2. Root Cause Profiling ──> 3. Targeted Fix ──> 4. Verification ──> 5. Audit Report
```

### Step 1: Baseline Measurement
1. Measure actual metrics before modifying code (bundle sizes, query execution times, render counts).
2. Never invent benchmark numbers.

### Step 2: Root-Cause Profiling
1. **Frontend:** Check `dist/` asset sizes using `scripts/analyze_bundle.py`. Review React component tree for unnecessary state lifting.
2. **Backend/Database:** Inspect Prisma queries against the [Performance Optimization Guide](./references/performance-optimization-guide.md). Check for missing composite indexes or N+1 sequential loops.

### Step 3: Targeted Optimization Implementation
1. **Code Splitting:** Lazy-load non-critical routes via `React.lazy()` and dynamic imports.
2. **Database Indexing:** Add composite indexes on foreign keys and `WHERE + ORDER BY` column pairs.
3. **List Virtualization:** Apply CSS `content-visibility: auto` to long challenge lists.

### Step 4: Verification & Audit
1. Build frontend: `npm run build --prefix frontend`.
2. Re-run `python .agents/skills/performance-engineer/scripts/analyze_bundle.py` to confirm budgets.

### Step 5: Report Generation
1. Format before/after delta comparisons using the [Performance Audit Template](./assets/performance_audit_template.md).

---

## 3. Supporting Resources (Level 3)

- **Performance Guide & Budgets:** [references/performance-optimization-guide.md](./references/performance-optimization-guide.md)
- **Bundle Budget Analyzer:** `python .agents/skills/performance-engineer/scripts/analyze_bundle.py [--dir frontend/dist]`
- **Audit Report Template:** [assets/performance_audit_template.md](./assets/performance_audit_template.md)
