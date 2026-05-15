#!/usr/bin/env bash
# build.sh — build the hu-learn image and push it to a registry
#
# Usage:
#   ./build.sh                        # prompts for registry/tag
#   ./build.sh ghcr.io/you/hu-learn   # use this image name, tag = latest
#   ./build.sh ghcr.io/you/hu-learn 1.2.0   # explicit tag

set -euo pipefail

# ── Args / defaults ───────────────────────────────────────────────────────────
IMAGE="${1:-}"
TAG="${2:-latest}"

if [[ -z "$IMAGE" ]]; then
  echo ""
  echo "  hu-learn image builder"
  echo "  ─────────────────────────────────────────────"
  echo "  Examples:"
  echo "    Docker Hub : yourusername/hu-learn"
  echo "    GHCR       : ghcr.io/yourusername/hu-learn"
  echo "    Self-hosted: registry.lan:5000/hu-learn"
  echo ""
  read -rp "  Image name: " IMAGE
  echo ""
fi

FULL="${IMAGE}:${TAG}"
echo "▶  Building  ${FULL}"

# ── Build ─────────────────────────────────────────────────────────────────────
# --platform linux/amd64 matches TrueNAS SCALE (x86-64)
# Remove --platform if your NAS is ARM (e.g. some Raspberry Pi setups)
docker build \
  --platform linux/amd64 \
  --tag "${FULL}" \
  .

echo "✔  Build complete: ${FULL}"

# ── Also tag as :latest if a specific version was given ───────────────────────
if [[ "$TAG" != "latest" ]]; then
  docker tag "${FULL}" "${IMAGE}:latest"
  echo "✔  Also tagged: ${IMAGE}:latest"
fi

# ── Push ─────────────────────────────────────────────────────────────────────
echo ""
read -rp "▶  Push to registry? [y/N] " PUSH
if [[ "$PUSH" =~ ^[Yy]$ ]]; then
  docker push "${FULL}"
  [[ "$TAG" != "latest" ]] && docker push "${IMAGE}:latest"
  echo ""
  echo "✔  Pushed successfully."
  echo ""
  echo "  Use this in TrueNAS → Custom App:"
  echo "    Image: ${FULL}"
  echo "    (or)   ${IMAGE}:latest"
fi
