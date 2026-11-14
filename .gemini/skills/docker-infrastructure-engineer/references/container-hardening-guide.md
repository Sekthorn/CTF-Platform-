# Docker Container Hardening & Challenge Isolation Standards

Mandatory security and resource configuration standards for running intentional vulnerabilities safely within WebSec CTF.

---

## 1. Security Isolation Boundaries

Vulnerable challenges must be isolated from the host machine, the core platform, and the production database.

### Critical Anti-Patterns (Strictly Prohibited)
1. **Host Docker Socket Mount:** NEVER mount `/var/run/docker.sock` into any challenge container. This allows instant container breakout to root on the host.
2. **`privileged: true`:** Challenge containers must NEVER run in privileged mode.
3. **Host Network Mode (`network_mode: "host"`):** Prohibited. Always use isolated custom bridge networks.
4. **Access to Production DB:** Challenge networks must not be bridged to the MySQL (`3306`) or Redis (`6379`) networks.

---

## 2. Recommended Hardening Directives

```yaml
services:
  vulnerable-target:
    image: websec/challenge-target:latest
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE # Only if binding to port < 1024
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 256M
    networks:
      - challenge-sandbox
```

---

## 3. Network Segmentation Matrix

| Network Name | Accessible Services | Outbound Internet Access | Purpose |
| :--- | :--- | :--- | :--- |
| **`platform-backend`** | NestJS backend, MySQL, Redis | Restricted | Main application core; zero access for challenges |
| **`challenge-sandbox`** | Target vulnerable container, reverse proxy port | Disallowed (internal: true) | Isolated lab execution; prevents outbound SSRF or botnet use |
| **`web-public`** | Nginx reverse proxy | Inbound HTTP/HTTPS only | External player access routing |

---

## 4. One-Command Startup Reliability
- Health checks must be defined on database and backend services.
- Container startup dependencies managed via `depends_on: { service: { condition: service_healthy } }`.
- Volume persistence configured properly for MySQL data (`mysql_data:/var/lib/mysql`).
