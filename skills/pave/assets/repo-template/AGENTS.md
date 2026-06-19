# PAVE Agent Contract

This repository uses PAVE: Plan, Approve, Verify, Execute.

Use `$pave` when available. The repo-local runtime lives under
`.codex/pave/`.

## Orchestrator Contract

For project initialization, feature work, bug fixes, changes,
analysis, reviews, refactors, docs sync, and continuation:

1. Read this file and `.codex/pave/config.md`.
2. Scan the repo before asking questions or editing.
3. Ask every product or policy clarification needed to remove
   ambiguity.
4. Create or update a checklist plan under `.codex/pave/plans/`.
5. Request one consolidated approval immediately before code or
   test edits.
6. Execute with Red-Green-Review.
7. Use bounded subagents only when useful.
8. Run declared verification commands before success claims.
9. Write final or blocked reports when durable handoff is useful.

## Declared Verification Commands

Replace these values during repo initialization:

- Setup: `not declared`
- Format: `not declared`
- Lint: `not declared`
- Unit tests: `not declared`
- Integration or E2E tests: `not declared`
- Build or typecheck: `not declared`

Do not claim completion for commands that are not declared or not
run. Report missing commands as setup gaps.
