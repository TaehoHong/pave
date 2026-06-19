#!/usr/bin/env python3
"""Initialize a repository with PAVE runtime and starter docs."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


PLUGIN_ROOT = Path(__file__).resolve().parents[1]
ASSETS = PLUGIN_ROOT / "skills" / "pave" / "assets"
REPO_TEMPLATE = ASSETS / "repo-template"
DOC_TEMPLATES = ASSETS / "docs-templates"


def iter_files(root: Path):
    for path in sorted(root.rglob("*")):
        if path.is_file():
            yield path


def copy_tree(src_root: Path, dst_root: Path, *, force: bool, dry_run: bool):
    created = []
    skipped = []
    for src in iter_files(src_root):
        rel = src.relative_to(src_root)
        dst = dst_root / rel
        if dst.exists() and not force:
            skipped.append(str(dst))
            continue
        created.append(str(dst))
        if not dry_run:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
    return created, skipped


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", nargs="?", default=".", help="Target repository path")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without writing")
    parser.add_argument("--skip-docs", action="store_true", help="Do not copy starter docs")
    args = parser.parse_args()

    repo = Path(args.repo).expanduser().resolve()
    if not repo.exists():
        if args.dry_run:
            print(f"would create repo directory: {repo}")
        else:
            repo.mkdir(parents=True)

    legacy = repo / ".codex" / "ai-dev-harness"
    current = repo / ".codex" / "pave"
    if legacy.exists() and not current.exists():
        print("legacy harness detected: .codex/ai-dev-harness")
        print("PAVE will install .codex/pave without deleting legacy files.")

    created, skipped = copy_tree(REPO_TEMPLATE, repo, force=args.force, dry_run=args.dry_run)
    doc_created = []
    doc_skipped = []
    if not args.skip_docs:
        doc_created, doc_skipped = copy_tree(
            DOC_TEMPLATES,
            repo / "docs",
            force=args.force,
            dry_run=args.dry_run,
        )

    for path in created + doc_created:
        print(f"created: {path}" if not args.dry_run else f"would create: {path}")
    for path in skipped + doc_skipped:
        print(f"skipped existing: {path}")

    print("PAVE initialization complete." if not args.dry_run else "PAVE dry run complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
