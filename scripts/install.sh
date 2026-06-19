#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

usage() {
  cat <<'USAGE'
Usage: install.sh <repo-path> [--companions default|full|none] [--force] [--dry-run] [--skip-docs]

Profiles:
  default  Install PAVE and require Superpowers. gstack is optional.
  full     Install PAVE, require Superpowers, and require gstack.
  none     Install only PAVE runtime files. Use for offline or unusual setups.

Examples:
  install.sh .
  install.sh ~/humuson/geo --companions full
USAGE
}

repo=""
companions="default"
force="no"
dry_run="no"
skip_docs="no"

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
    --force)
      force="yes"
      shift
      ;;
    --dry-run)
      dry_run="yes"
      shift
      ;;
    --skip-docs)
      skip_docs="yes"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --*)
      echo "error: unknown option: $1" >&2
      usage >&2
      exit 64
      ;;
    *)
      if [ -n "$repo" ]; then
        echo "error: unexpected argument: $1" >&2
        usage >&2
        exit 64
      fi
      repo="$1"
      shift
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

if [ -z "$repo" ]; then
  repo="."
fi

repo_dir="$(dirname "$repo")"
repo_base="$(basename "$repo")"
if [ -d "$repo_dir" ]; then
  repo_parent="$(cd "$repo_dir" && pwd -P)"
else
  repo_parent="$repo_dir"
fi
REPO_PATH="$repo_parent/$repo_base"

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

has_gstack() {
  [ -f "$HOME/.agents/skills/gstack/SKILL.md" ] && return 0
  [ -f "$HOME/gstack/.agents/skills/gstack/SKILL.md" ] && return 0
  command -v gstack >/dev/null 2>&1 && return 0
  return 1
}

ensure_superpowers() {
  if has_superpowers; then
    echo "companion: Superpowers detected"
    return 0
  fi

  if [ "$dry_run" = "yes" ]; then
    echo "would ensure: Superpowers companion"
    return 0
  fi

  if ! command -v codex >/dev/null 2>&1; then
    cat >&2 <<'MSG'
error: Superpowers is required for the default PAVE install, but Codex CLI was not found.

Install Superpowers in Codex, then rerun this installer. Known commands:
  codex plugin add superpowers@claude-plugins-official
  codex plugin add superpowers@superpowers-marketplace
  codex plugin add superpowers@openai-curated
MSG
    return 2
  fi

  for selector in \
    "superpowers@claude-plugins-official" \
    "superpowers@superpowers-marketplace" \
    "superpowers@openai-curated"
  do
    echo "companion: trying $selector"
    if codex plugin add "$selector" >/dev/null 2>&1; then
      if has_superpowers; then
        echo "companion: Superpowers installed via $selector"
        return 0
      fi
    fi
  done

  cat >&2 <<'MSG'
error: Superpowers is required for the default PAVE install, but automatic install failed.

Run one of these commands, then rerun this installer:
  codex plugin add superpowers@claude-plugins-official
  codex plugin add superpowers@superpowers-marketplace
  codex plugin add superpowers@openai-curated
MSG
  return 2
}

check_companions() {
  case "$companions" in
    none)
      echo "companion profile: none"
      ;;
    default)
      echo "companion profile: default"
      ensure_superpowers
      if has_gstack; then
        echo "companion: gstack detected (optional)"
      else
        echo "warning: gstack not detected (optional)"
      fi
      ;;
    full)
      echo "companion profile: full"
      ensure_superpowers
      if has_gstack; then
        echo "companion: gstack detected"
      else
        cat >&2 <<'MSG'
error: --companions full requires gstack, but gstack was not detected.

Install or expose gstack, then rerun this installer. PAVE checks:
  ~/.agents/skills/gstack/SKILL.md
  ~/gstack/.agents/skills/gstack/SKILL.md
  gstack command on PATH
MSG
        return 3
      fi
      ;;
  esac
}

check_companions

init_args=("$REPO_PATH")
if [ "$force" = "yes" ]; then
  init_args+=("--force")
fi
if [ "$dry_run" = "yes" ]; then
  init_args+=("--dry-run")
fi
if [ "$skip_docs" = "yes" ]; then
  init_args+=("--skip-docs")
fi

node "$SCRIPT_DIR/init_repo.js" "${init_args[@]}"
