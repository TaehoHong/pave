#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
PAVE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
MARKETPLACE_ROOT="$PAVE_ROOT"
MARKETPLACE_NAME="pave"

usage() {
  cat <<'USAGE'
Usage: install_plugin.sh [--dry-run]

Installs PAVE as a Codex plugin from this local source checkout.
Most users should install through the Git marketplace:
  codex plugin marketplace add TaehoHong/pave --ref main
  codex plugin add pave@pave

Examples:
  ./scripts/install_plugin.sh
  ./scripts/install_plugin.sh --dry-run
USAGE
}

dry_run="no"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      dry_run="yes"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unexpected argument: $1" >&2
      usage >&2
      exit 64
      ;;
  esac
done

run() {
  if [ "$dry_run" = "yes" ]; then
    printf 'would run:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

require_codex() {
  if ! command -v codex >/dev/null 2>&1; then
    echo "error: Codex CLI is required to install PAVE as a Codex plugin" >&2
    exit 69
  fi
}

ensure_marketplace_registered() {
  configured_root="$(codex plugin marketplace list 2>/dev/null | awk -v name="$MARKETPLACE_NAME" 'NR > 1 && $1 == name { print $2; exit }' || true)"
  if [ -n "$configured_root" ]; then
    canonical_configured="$(cd "$configured_root" 2>/dev/null && pwd -P || printf '%s' "$configured_root")"
    canonical_expected="$(cd "$MARKETPLACE_ROOT" && pwd -P)"
    if [ "$canonical_configured" != "$canonical_expected" ]; then
      echo "error: marketplace $MARKETPLACE_NAME is registered at $configured_root, not this PAVE source repo" >&2
      echo "remove or rename that marketplace before installing from this source" >&2
      exit 66
    fi
    echo "marketplace: $MARKETPLACE_NAME already registered"
    return 0
  fi
  run codex plugin marketplace add "$MARKETPLACE_ROOT"
}

install_pave_plugin() {
  run codex plugin add "pave@$MARKETPLACE_NAME"
}

require_codex
ensure_marketplace_registered
install_pave_plugin

echo "PAVE plugin install complete. Start a new Codex thread before testing newly installed skills."
