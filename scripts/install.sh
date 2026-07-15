#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"

usage() {
  cat <<'USAGE'
Usage: install.sh <repo-path> [--force] [--dry-run] [--skip-docs]

Examples:
  install.sh .
  install.sh ~/humuson/geo
USAGE
}

repo=""
force="no"
dry_run="no"
skip_docs="no"

while [ "$#" -gt 0 ]; do
  case "$1" in
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
