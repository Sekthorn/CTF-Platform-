# WebSec CTF — Production VPS Deployment Guide

This guide walks you through deploying **WebSec CTF** onto a Linux Virtual Private Server (VPS) for public or institutional training.

---

## 1. System Requirements

| Metric | Minimum Requirement | Recommended (Production) |
|---|---|---|
| **Operating System** | Ubuntu 22.04 / 24.04 LTS, Debian 12 | Ubuntu 24.04 LTS |
| **CPU** | 2 vCPU cores | 4 vCPU cores |
| **Memory (RAM)** | 2 GB | 4 GB - 8 GB |
| **Disk Space** | 25 GB SSD | 50 GB NVMe SSD |
| **Network** | Static Public IPv4, Ports 80 & 443 open | 1 Gbps port |

---

## 2. Server Preparation & Docker Installation

Connect to your clean VPS via SSH:

```bash
ssh root@your-server-ip
```

Update system packages and install Docker with Docker Compose plugin:

```bash
# 1. Update package index
sudo apt update && sudo apt upgrade -y

# 2. Install official Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Add current user to docker group
sudo usermod -aG docker $USER

# 4. Verify installation
docker --version
docker compose version
```

---

## 3. Clone Repository & Configure Environment

```bash
# 1. Clone repository into /opt/websec-ctf
git clone https://github.com/Sekthorn/CTF-Platform-.git /opt/websec-ctf
cd /opt/websec-ctf

# 2. Copy environment template
cp .env.example .env

# 3. Generate production secrets
nano .env
```

### Essential `.env` Variables for Production:
```dotenv
NODE_ENV=production
DOMAIN=ctf.yourdomain.com

# Use strong randomly generated passwords
DB_ROOT_PASSWORD=your_super_secure_root_password_here
DB_USER=websec_user
DB_PASSWORD=your_super_secure_db_password_here
DB_NAME=websec_ctf

REDIS_PASSWORD=your_super_secure_redis_password_here

# Generate random 64-char hex strings for JWT keys:
# openssl rand -hex 32
JWT_SECRET=your_production_jwt_secret_key_32_chars_or_more
JWT_REFRESH_SECRET=your_production_jwt_refresh_secret_key_32_chars_or_more

VITE_API_BASE_URL=/api/v1
```

---

## 4. Launch Production Containers

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Monitor startup progress:
```bash
docker compose -f docker-compose.prod.yml logs -f backend
```
The backend container will automatically run `prisma migrate deploy` and seed the initial security references, challenge categories, and administrator account.

---

## 5. Domain DNS & HTTPS Setup (Let's Encrypt / Certbot)

1. **Point DNS**: Create an `A` record pointing `ctf.yourdomain.com` $\rightarrow$ `your-server-ip`.
2. **Issue SSL Certificate**:
   ```bash
   sudo apt install certbot -y
   sudo certbot certonly --standalone -d ctf.yourdomain.com
   ```
3. Link certificates into `./infrastructure/certbot/conf/live/ctf.yourdomain.com/` and uncomment the SSL block in `./infrastructure/nginx/conf.d/default.conf`.
4. Reload Nginx:
   ```bash
   docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
   ```

---

## 6. Maintenance & Updates

### Automated Nightly Database Backups
Add a cron job to automatically back up MySQL every day at 02:00 AM:
```bash
crontab -e
```
Add the following line:
```cron
0 2 * * * cd /opt/websec-ctf && ./scripts/backup-db.sh > /var/log/ctf_backup.log 2>&1
```

### Updating the Platform
When a new version is released:
```bash
cd /opt/websec-ctf
git pull origin master
docker compose -f docker-compose.prod.yml up -d --build
```
Database migrations will apply automatically during container startup without data loss.
