---
name: docker-infrastructure-engineer
description: Manages Docker, Docker Compose, container networking, resource constraints, and isolated challenge environments for the CTF platform. Use when configuring docker-compose files, optimizing container build times, enforcing security isolation boundaries, managing reverse proxies, or troubleshooting container runtime issues.
---

# Docker & Infrastructure Engineer

Authoritative runbook for container orchestration, security isolation boundaries, and one-command local startup reliability in WebSec CTF.

---

## 1. Activation Conditions
Activate this skill when:
- Authoring or modifying `docker-compose.yml` configurations for the main platform or challenge labs.
- Configuring isolated container bridge networks to prevent unauthorized egress or platform database access.
- Applying CPU/memory caps, read-only filesystems, and dropping Linux capabilities on vulnerable containers.
- Troubleshooting container port mapping, DNS resolution, or proxy routing (Nginx).
- Optimizing multi-stage Dockerfiles and image caching for rapid development startup.

---

## 2. Core Workflow

```
1. Architecture Review ──> 2. Boundary Verification ──> 3. Hardening & Limits ──> 4. Automated Audit ──> 5. Runtime Verification
```

### Step 1: Architecture Review
1. Inspect service relationships, volume mounts, and network topologies.
2. Confirm challenges are separated from the core platform network (`platform-backend`).

### Step 2: Isolation Boundary Verification
1. Consult the [Container Hardening Guide](./references/container-hardening-guide.md).
2. Ensure no host Docker sockets (`/var/run/docker.sock`) are mounted.
3. Verify `privileged: true` is strictly prohibited.

### Step 3: Hardening & Resource Limits
1. Apply CPU (`cpus: '0.5'`) and memory (`memory: 256M`) limits.
2. Configure read-only root filesystems with `tmpfs` mounts where needed.
3. Use the [Isolated Compose Template](./assets/isolated_compose_template.yml).

### Step 4: Automated Security Audit
1. Run `python .agents/skills/docker-infrastructure-engineer/scripts/check_container_isolation.py <COMPOSE_FILE>` to scan for isolation flaws.

### Step 5: Startup & Teardown Verification
1. Ensure the platform starts reliably with `docker compose up -d` without manual intervention.

---

## 3. Supporting Resources (Level 3)

- **Container Hardening Guide:** [references/container-hardening-guide.md](./references/container-hardening-guide.md)
- **Isolation Audit Script:** `python .agents/skills/docker-infrastructure-engineer/scripts/check_container_isolation.py [COMPOSE_PATH]`
- **Isolated Compose Template:** [assets/isolated_compose_template.yml](./assets/isolated_compose_template.yml)
