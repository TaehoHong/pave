---
description: Report read-only project and PAVE workflow status.
---

# /status

Read-only PAVE status for the current repository.

Use this when you want to know where the project stands before deciding the
next action.

## Command Behavior

1. Do not edit files.
2. Read plugin-local PAVE rules and any existing repo instructions.
3. Summarize Current branch and working tree state.
4. Check whether optional PAVE runtime files exist:
   - `.codex/pave/`
   - `.codex/pave/plans/`
   - `.codex/pave/reports/`
   - `docs/`
5. Identify the latest relevant plan, report, unresolved decision, and declared
   verification command when present.
6. When `docs/07-codebase-guide.md` exists, report whether it has a committed
   revision and whether its recorded evidence paths have newer committed,
   staged, or unstaged changes. Do not inspect unrelated source.
7. Report likely next commands, such as `/project-init`, `/plan`, or
   `/sync-docs`, and recommend the default PAVE workflow when fresh
   verification is needed.

## Output

Return only status, risks, and suggested next steps. Do not create plans,
reports, docs, commits, or branches.
