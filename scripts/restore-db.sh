#!/usr/bin/env bash
# ==============================================================================
# WebSec CTF - Database Restoration Script
# ==============================================================================
set -euo pipefail

if [ -z "${1:-}" ]; then
    echo "Usage: ./scripts/restore-db.sh <path_to_backup_file.sql.gz>"
    echo -e "\nAvailable backups:"
    ls -lht backups/*.sql* 2>/dev/null || echo "No backups found in backups/ directory."
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Error: File '${BACKUP_FILE}' not found."
    exit 1
fi

if [ -f ".env" ]; then
    # shellcheck disable=SC2046
    export $(grep -v '^#' .env | xargs)
fi

DB_NAME="${DB_NAME:-websec_ctf}"
CONTAINER_NAME="websec-mysql"
DB_USER="root"
DB_PASSWORD="${DB_ROOT_PASSWORD:-123}"

if docker ps --format '{{.Names}}' | grep -q "websec-prod-mysql"; then
    CONTAINER_NAME="websec-prod-mysql"
fi

echo "⚠️  WARNING: Restoring will overwrite existing data in '${DB_NAME}' on '${CONTAINER_NAME}'."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
    echo "Restoration aborted."
    exit 0
fi

echo "⏳ Restoring database from '${BACKUP_FILE}'..."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" mysql -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}"
else
    docker exec -i "${CONTAINER_NAME}" mysql -u "${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "✅ Database restored successfully."
