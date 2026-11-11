#!/bin/sh
set -e

echo "🚀 [WebSec CTF] Starting backend service initialization..."

# 1. Wait for MySQL database to become responsive
echo "⏳ [WebSec CTF] Waiting for MySQL database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

until node -e 'const { PrismaClient } = require("@prisma/client"); const p = new PrismaClient(); p.$queryRawUnsafe("SELECT 1").then(() => { p.$disconnect(); process.exit(0); }).catch(() => { p.$disconnect(); process.exit(1); });' > /dev/null 2>&1 || [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   [WebSec CTF] Database not ready yet - retrying ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
  echo "⚠️ [WebSec CTF] Warning: Database connection check reached maximum attempts. Attempting migration..."
else
  echo "✅ [WebSec CTF] Database connection established successfully!"
fi

# 2. Apply Prisma schema migrations (non-destructive)
echo "📦 [WebSec CTF] Applying database migrations (prisma migrate deploy)..."
npx prisma migrate deploy

# 3. Seed initial database data idempotently
echo "🌱 [WebSec CTF] Verifying and applying initial database seed..."
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js || echo "⚠️ Seed executed with notices or skipped existing records."
elif [ -f "prisma/seed.ts" ] && command -v npx > /dev/null 2>&1; then
  npx ts-node -r tsconfig-paths/register prisma/seed.ts || echo "⚠️ Seed executed with notices or skipped existing records."
fi

echo "🛡️ [WebSec CTF] Initialization complete. Starting NestJS application..."
exec "$@"
