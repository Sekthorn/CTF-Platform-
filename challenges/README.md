# WebSec CTF — Vulnerable Challenge Repository

Welcome to the **WebSec CTF** challenge repository. All 50 vulnerable practice scenarios, target suites, and lab environments reside here.

---

## 1. Challenge Architecture Overview

The platform hosts **50 practical web security challenges** categorized across 5 core security domains (10 challenges per category) with 4 difficulty levels:

| Category | Challenges | Difficulty Progression | Target Port |
|---|---|---|---|
| **1. Authentication & Access Control** | 01 – 10 | Beginner (2), Easy (3), Medium (3), Hard (2) | `8081` |
| **2. SQL Injection** | 11 – 20 | Beginner (2), Easy (3), Medium (3), Hard (2) | `8082` |
| **3. Cross-Site Scripting (XSS)** | 21 – 30 | Beginner (2), Easy (3), Medium (3), Hard (2) | `8083` |
| **4. File Handling & Path Traversal** | 31 – 40 | Beginner (2), Easy (3), Medium (3), Hard (2) | `8084` |
| **5. API Security & Server-Side** | 41 – 50 | Beginner (2), Easy (3), Medium (3), Hard (2) | `8085` |

---

## 2. Running Challenge Lab Suites

Each category runs as an isolated, containerized target environment with zero-trust networking and strict resource boundaries.

### Start All 5 Category Lab Suites
```bash
docker compose -f challenges/docker-compose.labs.yml up -d --build
```

### Start an Individual Category Lab
```bash
# E.g. Start only SQL Injection Lab (Port 8082)
docker compose -f challenges/docker-compose.labs.yml up -d lab-sqli
```

### Stop All Labs
```bash
docker compose -f challenges/docker-compose.labs.yml down
```

---

## 3. Security & Isolation Standard

1. **Network Fence (`websec-challenge-net`)**:
   - Lab targets reside solely on `websec-challenge-net`.
   - Never connected to internal database networks (`websec-data-net`).
2. **Resource Constraints**:
   - Strict container constraints: `cpus: "0.50"`, `memory: 256M`.
3. **Privilege Drop**:
   - Capabilities dropped: `cap_drop: [ALL]`.
   - Privilege escalation blocked: `security_opt: [no-new-privileges:true]`.
   - Executed as non-root user (`ctfuser`).
4. **Flag Secrecy**:
   - Unique case-sensitive flags formatted as `WEBSEC{...}`.
   - Hashed with SHA-256 on the backend server; never exposed in public endpoints or frontend assets.
