# /pave

Use PAVE: Plan, Approve, Verify, Execute.

The shared PAVE source of truth stays in `.codex/pave/`; `.claude/agents/`
is the Claude Code adapter surface for specialist discovery.

## Command Behavior

1. Read `CLAUDE.md`, `AGENTS.md`, and `.codex/pave/config.md`.
2. If token-save is enabled in `.codex/pave/config.md`, keep the current
   configured model for planning and final review, and use the configured
   low-cost implementer only for bounded implementation tasks that do not need
   architecture, product, security, data-integrity, or API-design judgment.
3. Classify the request as project initialization, feature, bug, change,
   analysis, review, refactor, docs sync, continuation, or status.
4. Scan the repo before asking questions or editing.
5. Use the Small Change Fast Path only for a direct implementation request
   within both hard limits of two hand-edited files and twenty substantive
   hand-edited lines, with low risk and cheap narrow verification. State the
   expected files, line count, and verification before writing.
6. Apply the shared Decision Triage, Evidence, Extensibility, Decision Ledger,
   and Interview Progress gates. Ask only in-scope, material, user-owned
   questions that block the current slice.
7. Split independent subsystems and continue useful safe work when another
   subsystem has a partial blocker.
8. For standard implementation work, create or update a checklist plan in
   `.codex/pave/plans/`.
9. Ask once for implementation approval immediately before code or test edits
   unless the Small Change Fast Path applies.
10. Apply the PAVE Test Value Gate. Use Red-Green-Review only for tests that
   protect a concrete behavior or risk and can catch a realistic defect;
   otherwise use proportionate verification and report residual risk.
11. Delegate bounded work through the `.claude/agents/` adapter specialists only when useful.
12. Run declared verification commands before success claims.
13. Write a final or blocked report under `.codex/pave/reports/` when durable
    handoff is useful.
14. Track scope intent, read-only discovery, design decisions, and write
    approval separately. Read-only discovery does not require implementation
    approval. A design choice or clarification answer is not write approval.
    PAVE workflow and approval gates take precedence over instructions that
    optimize speed, terseness, or implementation size.

## Specialist Agents

- `pave-product-manager`
- `pave-planner`
- `pave-ui-ux-designer`
- `pave-fullstack-developer`
- `pave-qa-engineer`
