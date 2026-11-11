# WebSec CTF — System Architecture & Security Design

This document details the multi-tier system architecture, container networking boundaries, and security model of the **WebSec CTF** platform.

---

## 1. System Overview

```
                      [ External Internet / HTTPS:443 ]
                                     │
                                     ▼
                      ┌──────────────────────────────┐
                      │    Nginx Edge Ingress        │
                      │  - Rate Limiting (20r/s)     │
                      │  - SSL / TLS Termination     │
                      │  - Security HTTP Headers     │
                      └──────────────┬───────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────┐                         ┌─────────────────────────────┐
│  Frontend (React + Vite)    │                         │  Backend API (NestJS 11)    │
│  - Port 80 (Internal)       │                         │  - Port 3000 (Internal)     │
│  - Served via Nginx Alpine  │                         │  - Helmet + Throttler Guard │
└─────────────────────────────┘                         └──────────────┬──────────────┘
                                                                       │
                                                       ┌───────────────┴───────────────┐
                                                       ▼                               ▼
                                            ┌────────────────────┐          ┌────────────────────┐
                                            │ MySQL 8.4 Database │          │ Redis 7.4 Cache    │
                                            │ (Internal Network) │          │ (Internal Network) │
                                            └────────────────────┘          └────────────────────┘
```

---

## 2. Network Tier Segmentation

| Network Name | Scope | Accessibility | Attached Containers |
|---|---|---|---|
| `websec-edge-net` | Public Ingress | External ports 80/443 | Nginx Proxy |
| `websec-app-net` | Application Bridge | Internal only | Nginx, Frontend, Backend |
| `websec-data-net` | Data Tier (`internal: true`) | Zero external routing | Backend, MySQL, Redis |
| `websec-challenge-net` | Lab Sandbox | Isolated Bridge | Vulnerable Challenge Containers |

### Key Isolation Guarantees:
1. **Zero Data Tier Exposure**: MySQL and Redis do not bind to any host ports in production. They communicate exclusively with the backend container over `websec-data-net`.
2. **Challenge Containment**: Challenge containers run on a separate bridge network (`websec-challenge-net`). Even if a challenger executes remote code (RCE) inside a vulnerable container, the container has no network routes to the production database or host services.

---

## 3. Cryptographic Flag Verification Model

To eliminate flag leakage in APIs or client-side bundles:
1. **Never Store Plaintext**: Flags are stored inside MySQL as SHA-256 hashes (`flagHash`).
2. **Server-Side Evaluation**: When a user submits a flag:
   $$\text{Hash}(\text{raw\_flag}) \stackrel{?}{=} \text{Stored Flag Hash}$$
3. **Atomic Scoring**: Successful matches execute within a Prisma transaction:
   - Insert immutable record into `submissions`.
   - Transition `user_challenge_progress` to `SOLVED`.
   - Increment `user.totalPoints` atomically.
   - Detect duplicate solves and grant 0 additional points.
