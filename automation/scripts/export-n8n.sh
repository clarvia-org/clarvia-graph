#!/usr/bin/env bash
# automation/scripts/export-n8n.sh
#
# Export n8n workflows from a running container, normalise the output,
# and update automation/workflows/manifest.json.
#
# Usage:
#   ./automation/scripts/export-n8n.sh [CONTAINER_NAME]
#
# Default container name: clarvia-n8n
#
# Prerequisites:
#   - Docker is running and the n8n container is accessible
#   - jq is installed on the host
#
# Per blueprint §13.4:
#   - Runs n8n export:workflow --backup --output=/exports inside the container
#   - Normalises output: one file per workflow, consistent JSON formatting
#   - Retains workflow and node IDs
#   - Updates automation/workflows/manifest.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WORKFLOWS_DIR="$REPO_ROOT/automation/workflows"
MANIFEST="$WORKFLOWS_DIR/manifest.json"

CONTAINER="${1:-clarvia-n8n}"
EXPORT_PATH="/tmp/n8n-export-$$"

# ── Preflight checks ──────────────────────────────────────────────
command -v jq >/dev/null 2>&1 || { echo "Error: jq is required but not installed." >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: docker is required but not installed." >&2; exit 1; }

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "Error: Container '$CONTAINER' not found or not running." >&2
  exit 1
fi

# ── Export from container ─────────────────────────────────────────
echo "Exporting workflows from container '$CONTAINER'..."

docker exec "$CONTAINER" sh -c "rm -rf /exports && mkdir -p /exports"
docker exec "$CONTAINER" n8n export:workflow --backup --output=/exports

# Copy exported files to a temporary directory on the host
mkdir -p "$EXPORT_PATH"
docker cp "$CONTAINER:/exports/." "$EXPORT_PATH/"

EXPORTED_FILES=$(find "$EXPORT_PATH" -name '*.json' -type f)
if [ -z "$EXPORTED_FILES" ]; then
  echo "Warning: No workflow files were exported." >&2
  rm -rf "$EXPORT_PATH"
  exit 0
fi

echo "Found $(echo "$EXPORTED_FILES" | wc -l | tr -d ' ') exported workflow(s)."

# ── Normalise and write ──────────────────────────────────────────
mkdir -p "$WORKFLOWS_DIR"

# Build new manifest
MANIFEST_WORKFLOWS="{}"
CHANGED=0
NEW=0
UNCHANGED=0

for file in $EXPORTED_FILES; do
  # Read workflow name and ID
  WF_NAME=$(jq -r '.name // empty' "$file")
  WF_ID=$(jq -r '.id // empty' "$file")

  if [ -z "$WF_NAME" ]; then
    echo "  Skipping $(basename "$file"): no workflow name found."
    continue
  fi

  # Target filename: <workflow-name>.json
  TARGET_FILE="$WORKFLOWS_DIR/$WF_NAME.json"

  # Normalise JSON: sorted keys, 2-space indent, strip instance-specific fields
  NORMALISED=$(jq --sort-keys \
    'del(.meta.instanceId) | del(.updatedAt) | del(.createdAt)' \
    "$file")

  # Check if file changed
  if [ -f "$TARGET_FILE" ]; then
    EXISTING=$(jq --sort-keys '.' "$TARGET_FILE")
    if [ "$NORMALISED" = "$EXISTING" ]; then
      echo "  Unchanged: $WF_NAME"
      UNCHANGED=$((UNCHANGED + 1))
    else
      echo "  Updated:   $WF_NAME"
      CHANGED=$((CHANGED + 1))
    fi
  else
    echo "  New:       $WF_NAME"
    NEW=$((NEW + 1))
  fi

  echo "$NORMALISED" > "$TARGET_FILE"

  # Add to manifest
  MANIFEST_WORKFLOWS=$(echo "$MANIFEST_WORKFLOWS" | jq \
    --arg name "$WF_NAME" \
    --arg filename "$WF_NAME.json" \
    --arg id "$WF_ID" \
    '. + {($name): {"file": $filename, "id": $id}}')
done

# ── Update manifest.json ─────────────────────────────────────────
# Read existing manifest version or default to 1
MANIFEST_VERSION=1
if [ -f "$MANIFEST" ]; then
  MANIFEST_VERSION=$(jq -r '.version // 1' "$MANIFEST")
fi

echo "{\"version\": $MANIFEST_VERSION, \"workflows\": $MANIFEST_WORKFLOWS}" | \
  jq --sort-keys '.' > "$MANIFEST"

# ── Cleanup ───────────────────────────────────────────────────────
rm -rf "$EXPORT_PATH"
docker exec "$CONTAINER" sh -c "rm -rf /exports" 2>/dev/null || true

# ── Summary ───────────────────────────────────────────────────────
TOTAL=$((CHANGED + NEW + UNCHANGED))
echo ""
echo "Export complete:"
echo "  Total:     $TOTAL"
echo "  New:       $NEW"
echo "  Updated:   $CHANGED"
echo "  Unchanged: $UNCHANGED"
echo "  Manifest:  $MANIFEST"
