#!/usr/bin/env bash
# ==============================================================================
# WebSec CTF - Automated Database Backup Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/websec_ctf_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

# Source environment variables if .env exists
if [ -f ".env" ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | xargs)
fi

DB_NAME="${DB_NAME:-websec_ctf}"
DB_USER="${DB_USER:-websec_user}"
DB_PASSWORD="${DB_PASSWORD:-websec_password}"
CONTAINER_NAME="websec-mysql"

# Detect if production container is running instead
if docker ps --format '{{.Names}}' | grep -q "websec-prod-mysql"; then
    CONTAINER_NAME="websec-prod-mysql"
    DB_USER="root"
    DB_PASSWORD="${DB_ROOT_PASSWORD}"
fi

echo "📦 Starting database backup from container '${CONTAINER_NAME}'..."

if ! docker ps --format '{{.Names}}' | grep -q "${CONTAINER_NAME}"; then
    echo "❌ Error: MySQL container '${CONTAINER_NAME}' is not running."
    exit 1
fi

docker exec "${CONTAINER_NAME}" mysqldump \
    --user="${DB_USER}" \
    --password="${DB_PASSWORD}" \
    --single-transaction \
    --quick \
    --databases "${DB_NAME}" \
    | gzip > "${FILENAME}"

echo "✅ Backup successfully created at: ${FILENAME}"
ls -lh "${FILENAME}"
