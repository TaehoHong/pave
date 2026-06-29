# /pave

Use PAVE: Plan, Approve, Verify, Execute.

Use the plugin-local PAVE skill and references as the default source of truth.
Repo-local files are optional and exist only after `/project-init` or an
explicit user request. `.claude/agents/` is the Claude Code adapter surface for
specialist discovery when the optional repo runtime has been initialized.

## Command Behavior

1. Use the plugin-local PAVE skill and references for workflow rules.
2. Read `CLAUDE.md`, `AGENTS.md`, and `.codex/pave/config.md` only when they
   already exist in the target repo.
3. If token-save is enabled in `.codex/pave/config.md`, keep the current
   configured model for planning and final review, and use the configured
   low-cost implementer only for bounded implementation tasks that do not need
   architecture, product, security, data-integrity, or API-design judgment.
4. Classify the request as project initialization, feature, bug, change,
   analysis, review, refactor, docs sync, continuation, or status.
5. Scan the repo before asking questions or editing.
6. Ask every product, policy, design, deployment, or verification question
   needed to remove ambiguity.
7. Apply the Feature Decision Gate before implementation work.
8. For implementation work, keep a checklist in the conversation by default.
   Create or update `.codex/pave/plans/` only when the optional repo runtime
   exists or the user explicitly asks for durable repo-local plans.
9. Ask once for implementation approval immediately before code or test edits.
10. Execute with Red-Green-Review after approval.
11. Delegate bounded work through plugin role briefs or initialized adapter
   specialists only when useful.
12. Run declared verification commands before success claims.
13. Write a final or blocked report under `.codex/pave/reports/` only when the
    optional repo runtime exists or the user explicitly asks for durable
    repo-local reports.

## Feature Decision Gate

Before code or test edits, identify the feature inventory for the requested
product slice and settle per-feature policy decisions: actor, trigger, happy
path, edge cases, permissions, data rules, errors, acceptance criteria, and
verification. If any of these change behavior or scope and remain unknown, ask
before implementation.

## Repo-Local File Guard

Do not create `AGENTS.md`, `CLAUDE.md`, `.codex/pave/`, or `docs/` unless the user invokes `/project-init` or explicitly asks to install PAVE runtime files in the repository.

## Specialist Agents

- `pave-product-manager`
- `pave-planner`
- `pave-ui-ux-designer`
- `pave-fullstack-developer`
- `pave-qa-engineer`
