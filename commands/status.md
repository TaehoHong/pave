---
description: Report read-only project and PAVE workflow status.
---

# /status

Read-only PAVE status for the current repository.

Use this when you want to know where the project stands before deciding the
next action.

## Command Behavior

1. Do not edit files.
2. Read applicable repository instructions only. Do not load implementation
   workflow references.
3. Summarize Current branch and working tree state.
4. Check whether optional PAVE runtime files exist:
   - `.codex/pave/`
   - `.codex/pave/plans/`
   - `.codex/pave/reports/`
   - `docs/`
5. List plan and report directories without opening every file. Select the
   newest file by modification time and read at most one plan and one report.
   Identify unresolved decisions only from the current conversation and those
   selected files. Report a declared verification command when present.
6. When `docs/07-codebase-guide.md` exists, report whether it has a committed
   revision and whether the guide file itself has staged or unstaged changes.
   Do not scan source files or validate the guide's recorded evidence paths
   during general status; task-specific context retrieval owns that check.
7. Report likely next commands, such as `/project-init`, `/plan`, or
   `/sync-docs`, and recommend the default PAVE workflow when fresh
   verification is needed.

## Output

Return only status, risks, and suggested next steps. Do not create plans,
reports, docs, commits, or branches.
