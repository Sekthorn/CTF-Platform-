#!/usr/bin/env bash
# ==============================================================================
# WebSec CTF - Automated Developer Onboarding & Installation Script
# ==============================================================================
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}   WebSec CTF — Developer Environment Setup        ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Prerequisite Checks
echo -e "\n${YELLOW}[1/4] Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker Engine or Docker Desktop first.${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose V2 is not available. Please install docker-compose-plugin.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose detected.${NC}"

# 2. Environment Configuration
echo -e "\n${YELLOW}[2/4] Configuring environment (.env)...${NC}"

if [ ! -f ".env" ]; then
    echo -e "Creating .env from .env.example..."
    cp .env.example .env

    # Generate secure random secrets
    if command -v openssl &> /dev/null; then
        JWT_SEC=$(openssl rand -hex 24)
        REFRESH_SEC=$(openssl rand -hex 24)
        DB_PASS=$(openssl rand -hex 16)
        REDIS_PASS=$(openssl rand -hex 16)

        # Portable sed replacement
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=${JWT_SEC}/" .env && rm -f .env.bak
        sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=${REFRESH_SEC}/" .env && rm -f .env.bak
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" .env && rm -f .env.bak
        sed -i.bak "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=${REDIS_PASS}/" .env && rm -f .env.bak
        echo -e "${GREEN}✓ Generated secure random credentials in .env${NC}"
    else
        echo -e "${YELLOW}Notice: openssl not found; using default development secrets.${NC}"
    fi
else
    echo -e "${GREEN}✓ Existing .env file found. Preserving current configuration.${NC}"
fi

# 3. Build & Launch Docker Services
echo -e "\n${YELLOW}[3/4] Building and launching containers...${NC}"
docker compose up -d --build

# 4. Verification
echo -e "\n${YELLOW}[4/4] Verifying services health...${NC}"
echo "Waiting 10 seconds for service bootstrapping..."
sleep 10

docker compose ps

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}   WebSec CTF is now running!                       ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "Frontend UI:         http://localhost:5173"
echo -e "Backend API Base:    http://localhost:3000/api/v1"
echo -e "Swagger Docs:        http://localhost:3000/api/v1/docs"
echo -e "Health Check:        http://localhost:3000/api/v1/health"
echo -e "MySQL Port (Dev):    3307"
echo -e "\nDefault Dev Accounts:"
echo -e "  Admin:    admin / AdminSecurePass2026!"
echo -e "  Student:  student_hacker / StudentPass2026!"
echo -e "====================================================\n"
