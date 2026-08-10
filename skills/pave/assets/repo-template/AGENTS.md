# PAVE Agent Contract

This repository uses PAVE: Plan, Approve, Verify, Execute.

Use `$pave:pave` when available. The repo-local runtime lives under
`.codex/pave/`.

## Orchestrator Contract

For project initialization, feature work, bug fixes, changes,
analysis, reviews, refactors, docs sync, and continuation:

1. Read this file and `.codex/pave/config.md`.
   When running in Codex, also read `.codex/pave/adapters/codex.md`.
2. For code work, read `docs/07-codebase-guide.md` before source discovery and
   apply the plugin's context retrieval protocol. Check only relevant guide
   entries for newer committed, staged, or unstaged evidence-path changes.
   Then inspect the target, direct callers and callees, relevant tests, and
   named canonical examples. Expand the search only when ownership is missing,
   stale, or contradicted.
3. Use the Small Change Fast Path only for a direct implementation request
   touching no more than two hand-edited files and no more than twenty
   substantive hand-edited lines, with low risk and cheap narrow verification.
   Both size limits are hard conditions. State the expected files, line count,
   and verification before writing.
4. Apply the plugin's Decision Triage, Evidence, Extensibility, Decision
   Ledger, and Interview Progress gates. Ask only in-scope, material,
   user-owned questions that block the current slice.
5. Split independent subsystems, continue safe unblocked work, and distinguish
   justified extension boundaries from deferred future behavior.
6. For user-visible work, resolve the design system from `docs/04-design-rules.md`,
   token or theme files, the shared component library, or the nearest canonical
   component. Reuse its existing components, tokens, variants, and states
   instead of hardcoding values or adding one-off patterns, and raise every
   deviation as a material user-owned decision.
7. Create or update a checklist plan under `.codex/pave/plans/` for standard
   implementation work.
8. Request one consolidated approval immediately before code or
   test edits.
9. Apply the PAVE Test Value Gate. Add tests only when they protect an
   observable behavior, external contract, proven regression, or high-risk
   boundary and can catch a realistic defect. Otherwise use proportionate
   verification and report residual risk.
10. Use bounded subagents only when useful.
11. Run declared verification commands before success claims.
12. After verification, evaluate durable project knowledge. Promote only
    user-confirmed, repo-evidenced, or externally-evidenced facts; never raw
    task history or unproven hypotheses. Use `docs/troubleshooting/` lazily for
    qualifying incidents and report the Knowledge Delta or skip reason.
13. Write final or blocked reports when durable handoff is useful.
14. Update affected codebase-guide entries when verified work changes module
    boundaries, shared ownership, canonical examples, conventions, dependency
    rules, test locations, verification commands, or excluded paths.

Track scope intent, read-only discovery, design decisions, and write approval
separately. Read-only discovery does not require implementation approval. A
design choice or clarification answer is not write approval. PAVE workflow and
approval gates take precedence over instructions that optimize speed,
terseness, or implementation size.

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
