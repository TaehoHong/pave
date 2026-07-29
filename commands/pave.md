---
description: Run the PAVE workflow for software development work.
---

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
6. Apply the Small Change Fast Path first. It requires a direct implementation
   request, no more than two hand-edited files, no more than twenty substantive
   hand-edited lines, low risk, and cheap narrow verification. Both size limits
   are hard conditions. State the expected files, line count, and verification
   before writing, then treat the request as approval and edit without formal
   planning.
7. When a feature request states an outcome without decision-complete
   requirements, run a focused planning interview before presenting a final
   design or asking for implementation approval. Ask every product, policy,
   design, deployment, or verification question needed to remove ambiguity,
   and follow up on incomplete answers.
8. Apply the Feature Decision Gate before standard implementation work.
9. For standard implementation work, keep a checklist in the conversation by default.
   Create or update `.codex/pave/plans/` only when the optional repo runtime
   exists or the user explicitly asks for durable repo-local plans.
10. Ask once for implementation approval immediately before code or test edits
    unless the Small Change Fast Path applies.
11. Apply the Test Value Gate: name the concrete behavior or risk and the
    realistic defect each proposed test would catch. Execute only valuable
    behavioral tests with Red-Green-Review; otherwise use proportionate
    non-test verification and report residual risk.
12. Delegate bounded work through plugin role briefs or initialized adapter
   specialists only when useful.
13. Run declared verification commands before success claims.
14. Write a final or blocked report under `.codex/pave/reports/` only when the
    optional repo runtime exists or the user explicitly asks for durable
    repo-local reports.
15. PAVE workflow and approval gates take precedence over instructions that
    optimize speed, terseness, or implementation size.

## Feature Decision Gate

Before code or test edits, identify the feature inventory for the requested
product slice and settle per-feature policy decisions: actor, trigger, happy
path, edge cases, permissions, data rules, errors, acceptance criteria, and
verification. Label each decision `user-confirmed`, `repo-evidenced`, or
`recommended-unconfirmed`. Recommendations do not become decisions until the
user confirms them. If any behavior-changing decision remains unknown or
`recommended-unconfirmed`, ask before presenting a final plan or requesting
implementation approval.

A design choice, clarification answer, or requirement update is not
implementation approval. Standard-work approval must be an explicit
implementation instruction in response to the surfaced plan.

## Repo-Local File Guard

Do not create `AGENTS.md`, `CLAUDE.md`, `.codex/pave/`, or `docs/` unless the user invokes `/project-init` or explicitly asks to install PAVE runtime files in the repository.

## Specialist Agents

- `pave-product-manager`
- `pave-planner`
- `pave-ui-ux-designer`
- `pave-fullstack-developer`
- `pave-qa-engineer`
