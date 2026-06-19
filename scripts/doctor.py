#!/usr/bin/env python3
"""Check whether a repository has the expected PAVE runtime files."""

from __future__ import annotations

import argparse
from pathlib import Path


REQUIRED_FILES = [
    "AGENTS.md",
    "CLAUDE.md",
    ".codex/pave/README.md",
    ".codex/pave/config.md",
    ".codex/pave/templates/plan.md",
    ".codex/pave/templates/subagent-brief.md",
    ".codex/pave/templates/final-report.md",
    ".codex/pave/templates/blocked-report.md",
    ".codex/pave/adapters/codex.md",
    ".codex/pave/adapters/claude-code.md",
    ".codex/pave/adapters/generic-agent.md",
    ".claude/commands/pave.md",
    ".claude/agents/product-manager.md",
    ".claude/agents/planner.md",
    ".claude/agents/ui-ux-designer.md",
    ".claude/agents/fullstack-developer.md",
    ".claude/agents/qa-engineer.md",
    "docs/00-overview.md",
    "docs/01-roadmap.md",
    "docs/02-development-rules.md",
    "docs/03-deployment-rules.md",
    "docs/04-design-rules.md",
    "docs/05-quality-rules.md",
]

REQUIRED_DIRS = [
    ".codex/pave/plans",
    ".codex/pave/reports",
]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("repo", nargs="?", default=".", help="Target repository path")
    args = parser.parse_args()
    repo = Path(args.repo).expanduser().resolve()

    missing = []
    for rel in REQUIRED_FILES:
        if not (repo / rel).is_file():
            missing.append(rel)
    for rel in REQUIRED_DIRS:
        if not (repo / rel).is_dir():
            missing.append(rel + "/")

    if (repo / ".codex" / "ai-dev-harness").exists() and not (repo / ".codex" / "pave").exists():
        print("warning: legacy .codex/ai-dev-harness exists without .codex/pave")

    if missing:
        print("PAVE doctor failed. Missing:")
        for rel in missing:
            print(f"- {rel}")
        return 1

    print("PAVE doctor passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
