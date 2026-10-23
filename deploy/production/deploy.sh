#!/usr/bin/env bash
# Zero-downtime deploy for azam-portfolio (static site, nginx).
#
# The current container keeps serving through fetch + build + health-check.
# --no-deps so nothing else is touched. The site is stateless (no volumes,
# no DB), so a failed post-swap check simply restores the previous image.
#
# Usage: deploy/production/deploy.sh [branch]   (default branch: main)
# On the server: ~/scripts/azam-portfolio-deploy.sh [branch] calls this script.
#
# The `git pull` below may update this very file; the running deploy keeps the
# version it started with and the new version applies from the next run.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$DEPLOY_DIR/../.." && pwd)"
SERVICE="azam-portfolio-web"
CONTAINER="azam-portfolio"
IMAGE="azam-portfolio:latest"
ROLLBACK_IMAGE="azam-portfolio:previous"
PORT=3200
STAGING_PORT=3299
STAGING_NAME="azam-portfolio-staging"
HEALTH_PATH="/"
BRANCH="${1:-main}"
LOCK_FILE="/tmp/azam-portfolio-deploy.lock"

log() { printf '[%s] azam-portfolio-deploy: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  log "Another deploy is already in progress (lock: $LOCK_FILE) — aborting."
  exit 1
fi

cleanup_staging() { docker rm -f "$STAGING_NAME" >/dev/null 2>&1 || true; }
trap cleanup_staging EXIT

wait_healthy() {
  local port="$1" attempts="$2"
  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "http://localhost:${port}${HEALTH_PATH}" -o /dev/null; then
      return 0
    fi
    sleep 1
  done
  return 1
}

log "[1/6] Fetching latest ($BRANCH)"
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
cd "$DEPLOY_DIR"

log "[2/6] Recording currently running image as rollback target"
PREVIOUS_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$CONTAINER" 2>/dev/null || true)"
if [ -n "$PREVIOUS_IMAGE_ID" ]; then
  docker tag "$PREVIOUS_IMAGE_ID" "$ROLLBACK_IMAGE"
  log "     Rollback target: $PREVIOUS_IMAGE_ID -> $ROLLBACK_IMAGE"
else
  log "     WARNING: no running container found to snapshot — rollback will be unavailable."
fi

log "[3/6] Building new image locally (current container keeps serving)"
docker compose build "$SERVICE"

log "[4/6] Health-checking the new image on a throwaway port :$STAGING_PORT"
cleanup_staging
docker run -d --name "$STAGING_NAME" \
  --network host \
  -e PORT="$STAGING_PORT" \
  "$IMAGE"

if wait_healthy "$STAGING_PORT" 30; then
  log "     New image is healthy on staging port"
else
  docker logs --tail 50 "$STAGING_NAME" 2>&1 || true
  cleanup_staging
  log "New image failed its health check — aborting. Running container untouched."
  exit 1
fi
cleanup_staging

log "[5/6] Swapping the app container"
docker compose up -d --no-deps "$SERVICE"

log "[6/6] Verifying on :$PORT"
if wait_healthy "$PORT" 30; then
  log "OK: site responding on :${PORT} ($(git -C "$REPO_DIR" rev-parse --short HEAD))"
  exit 0
fi

log "Health check failed after swap."
if [ -n "$PREVIOUS_IMAGE_ID" ]; then
  log "Rolling back to previous image ($ROLLBACK_IMAGE)"
  docker tag "$ROLLBACK_IMAGE" "$IMAGE"
  docker compose up -d --no-deps "$SERVICE"
  if wait_healthy "$PORT" 30; then
    log "Rollback OK: site responding on :${PORT} (previous image restored)."
  else
    log "Rollback health check ALSO failed — manual intervention required."
    log "Check: docker compose -f $DEPLOY_DIR/docker-compose.yml logs $SERVICE"
  fi
else
  log "No previous image was recorded — cannot auto-rollback. Manual intervention required."
  log "Check: docker compose -f $DEPLOY_DIR/docker-compose.yml logs $SERVICE"
fi
exit 1
