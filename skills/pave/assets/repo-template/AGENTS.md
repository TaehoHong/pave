# PAVE Agent Contract

This repository uses PAVE: Plan, Approve, Verify, Execute.

Use `$pave:pave` when available. The repo-local runtime lives under
`.codex/pave/`.

## Orchestrator Contract

For project initialization, feature work, bug fixes, changes,
analysis, reviews, refactors, docs sync, and continuation:

1. Read this file and `.codex/pave/config.md`.
   When running in Codex, also read `.codex/pave/adapters/codex.md`.
2. Scan the repo before asking questions or editing.
3. Use the Small Change Fast Path for a concrete, low-risk edit normally
   limited to two files and roughly twenty substantive lines with cheap narrow
   verification. Treat the request as approval and skip formal planning.
4. Ask every product or policy clarification needed to remove
   ambiguity.
5. Create or update a checklist plan under `.codex/pave/plans/` for standard
   implementation work.
6. Request one consolidated approval immediately before code or
   test edits.
7. Apply the PAVE Test Value Gate. Add tests only when they protect an
   observable behavior, external contract, proven regression, or high-risk
   boundary and can catch a realistic defect. Otherwise use proportionate
   verification and report residual risk.
8. Use bounded subagents only when useful.
9. Run declared verification commands before success claims.
10. Write final or blocked reports when durable handoff is useful.

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
