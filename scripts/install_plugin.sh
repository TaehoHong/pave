#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
PAVE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd -P)"
MARKETPLACE_ROOT="$PAVE_ROOT"
MARKETPLACE_NAME="pave"

usage() {
  cat <<'USAGE'
Usage: install_plugin.sh [--companions default|full|none] [--dry-run]

Installs PAVE as a Codex plugin from this local source checkout.
Most users should install through the Git marketplace:
  codex plugin marketplace add TaehoHong/pave --ref main
  codex plugin add pave@pave

Profiles:
  default  Install PAVE plugin and ensure Superpowers. gstack is optional.
  full     Install PAVE plugin, ensure Superpowers, and require gstack detection.
  none     Install only the PAVE plugin. Use for offline or unusual setups.

Examples:
  ./scripts/install_plugin.sh
  ./scripts/install_plugin.sh --companions full
USAGE
}

companions="default"
dry_run="no"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --companions)
      if [ "$#" -lt 2 ]; then
        echo "error: --companions requires default, full, or none" >&2
        exit 64
      fi
      companions="$2"
      shift 2
      ;;
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

case "$companions" in
  default|full|none) ;;
  *)
    echo "error: --companions must be default, full, or none" >&2
    exit 64
    ;;
esac

run() {
  if [ "$dry_run" = "yes" ]; then
    printf 'would run:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

has_superpowers() {
  if command -v codex >/dev/null 2>&1; then
    if codex plugin list 2>/dev/null | grep -E 'superpowers@.*installed, enabled' >/dev/null 2>&1; then
      return 0
    fi
  fi
  compgen -G "$HOME/.codex/plugins/cache/claude-plugins-official/superpowers/*/skills/using-superpowers/SKILL.md" >/dev/null 2>&1 && return 0
  compgen -G "$HOME/.codex/plugins/cache/openai-curated-remote/superpowers/*/skills/using-superpowers/SKILL.md" >/dev/null 2>&1 && return 0
  [ -f "$HOME/.codex/skills/superpowers/using-superpowers/SKILL.md" ] && return 0
  [ -f "$HOME/.agents/skills/superpowers/using-superpowers/SKILL.md" ] && return 0
  return 1
}

ensure_superpowers() {
  if has_superpowers; then
    echo "companion: Superpowers detected"
    return 0
  fi

  for selector in \
    "superpowers@claude-plugins-official" \
    "superpowers@superpowers-marketplace" \
    "superpowers@openai-curated"
  do
    echo "companion: trying $selector"
    if run codex plugin add "$selector"; then
      if [ "$dry_run" = "yes" ] || has_superpowers; then
        echo "companion: Superpowers installed or scheduled via $selector"
        return 0
      fi
    fi
  done

  cat >&2 <<'MSG'
error: Superpowers is required for the default PAVE plugin install, but automatic install failed.

Run one of these commands, then rerun this installer:
  codex plugin add superpowers@claude-plugins-official
  codex plugin add superpowers@superpowers-marketplace
  codex plugin add superpowers@openai-curated
MSG
  return 2
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

case "$companions" in
  none)
    echo "companion profile: none"
    ;;
  default|full)
    ensure_superpowers
    run "$SCRIPT_DIR/check_companions.sh" --companions "$companions"
    ;;
esac

echo "PAVE plugin install complete. Start a new Codex thread before testing newly installed skills."
