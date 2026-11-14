# Performance Engineering & Optimization Guide

Reference manual for diagnosing and resolving performance bottlenecks across MySQL 8.4, NestJS, and React on laptop and desktop devices.

---

## 1. MySQL EXPLAIN Query Analysis Standards

When analyzing SQL execution plans:
- **`type: ALL` (Full Table Scan):** Critical warning. Must be resolved using indexes if table exceeds 100 rows.
- **`type: index`:** Scans entire index tree. Better than ALL, but investigate if `range` or `ref` is achievable.
- **`type: range`:** Index range scan (used for `<`, `>`, `BETWEEN`, `IN`). Healthy for pagination and date filters.
- **`type: ref` / `eq_ref`:** Primary key or unique index lookup. Ideal performance target.
- **`Extra: Using filesort` / `Using temporary`:** Indicates MySQL cannot resolve `ORDER BY` or `GROUP BY` with indexes. Add composite indexes matching the `WHERE + ORDER BY` column sequence:
  ```sql
  -- Example: Optimizing challenge list sorting
  CREATE INDEX idx_challenge_category_difficulty ON Challenge(categoryId, difficulty);
  ```

---

## 2. React Rendering & Laptop Resource Guidelines

- **Target Laptop Screen Resolutions:** $1366\times 768$, $1440\times 900$, $1536\times 864$, $1920\times 1080$, $2560\times 1440$.
- **Code-Splitting via `React.lazy`:** All routes outside initial entry points must be lazy-loaded to keep entry bundle $< 120\text{ kB}$.
- **Rendering Virtualization & `content-visibility`:**
  - For long lists (e.g., 50+ challenges or scoreboard rows), apply CSS `content-visibility: auto; contain-intrinsic-size: 180px;` to skip offscreen rendering.
- **Memoization Rules:**
  - Do NOT wrap every component in `React.memo()`. Only memoize when profiling confirms re-rendering with identical props takes $> 4\text{ms}$.

---

## 3. Bundle Size Budgets

| Chunk Type | Warning Threshold | Critical Threshold |
| :--- | :--- | :--- |
| **Initial Entry (`index.js`)** | $> 120\text{ kB}$ | $> 200\text{ kB}$ |
| **Vendor Chunks (`vendor-react.js`)** | $> 180\text{ kB}$ | $> 250\text{ kB}$ |
| **Lazy Route Pages (`LoginPage.js`, etc.)** | $> 50\text{ kB}$ | $> 100\text{ kB}$ |
| **CSS Bundle (`index.css`)** | $> 80\text{ kB}$ | $> 150\text{ kB}$ |
