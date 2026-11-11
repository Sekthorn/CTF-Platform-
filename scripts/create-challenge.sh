#!/usr/bin/env bash
# ==============================================================================
# WebSec CTF - Challenge Scaffolding Helper
# ==============================================================================
set -euo pipefail

TITLE="${1:-}"
CATEGORY="${2:-Injection}"
DIFFICULTY="${3:-Easy}"
POINTS="${4:-100}"

if [ -z "${TITLE}" ]; then
    echo "Usage: ./scripts/create-challenge.sh <Title> [Category] [Difficulty] [Points]"
    echo "Example: ./scripts/create-challenge.sh 'SQLi Login Bypass' 'Injection' 'Easy' 100"
    exit 1
fi

# Generate slug
SLUG=$(echo "${TITLE}" | tr '[:upper:]' '[:lower:]' | sed -e 's/[^a-z0-9]/-/g' -e 's/^-//' -e 's/-$//')
TARGET_DIR="challenges/${SLUG}"

if [ -d "${TARGET_DIR}" ]; then
    echo "❌ Error: Directory '${TARGET_DIR}' already exists."
    exit 1
fi

echo "🚀 Scaffolding new challenge in '${TARGET_DIR}'..."
cp -r challenges/_template "${TARGET_DIR}"

# Update challenge.json
sed -i.bak "s/\"title\": .*/\"title\": \"${TITLE}\",/" "${TARGET_DIR}/challenge.json"
sed -i.bak "s/\"slug\": .*/\"slug\": \"${SLUG}\",/" "${TARGET_DIR}/challenge.json"
sed -i.bak "s/\"category\": .*/\"category\": \"${CATEGORY}\",/" "${TARGET_DIR}/challenge.json"
sed -i.bak "s/\"difficulty\": .*/\"difficulty\": \"${DIFFICULTY}\",/" "${TARGET_DIR}/challenge.json"
sed -i.bak "s/\"points\": .*/\"points\": ${POINTS},/" "${TARGET_DIR}/challenge.json"
rm -f "${TARGET_DIR}/challenge.json.bak"

echo "✅ Challenge '${TITLE}' scaffolded successfully at '${TARGET_DIR}'."
echo "👉 Customize '${TARGET_DIR}/app.py' and '${TARGET_DIR}/challenge.json' to finalize your scenario."
