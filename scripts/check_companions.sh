#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: check_companions.sh [--companions default|full|none]

Checks whether PAVE companion tools are available.
USAGE
}

companions="default"

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

status=0

echo "companion profile: $companions"

if [ "$companions" = "none" ]; then
  echo "SUPERPOWERS=skipped"
  echo "GSTACK=skipped"
  exit 0
fi

if has_superpowers; then
  echo "SUPERPOWERS=installed"
else
  echo "SUPERPOWERS=missing"
  echo "hint: codex plugin add superpowers@claude-plugins-official"
  status=2
fi

if has_gstack; then
  echo "GSTACK=installed"
else
  echo "GSTACK=missing"
  if [ "$companions" = "full" ]; then
    status=3
  else
    echo "hint: gstack is optional for the default profile"
  fi
fi

exit "$status"
