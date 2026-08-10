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
7. When a feature request states an outcome without implementation-ready
   requirements, load and apply `skills/pave/references/design.md`. Triage
   material user-owned decisions, establish evidence, separate justified
   extension boundaries from deferred behavior, maintain the decision ledger,
   and expose interview progress before presenting a final design.
8. When the work changes a user-visible surface, load and apply
   `skills/pave/references/design-system.md`. Resolve the project's design
   system, name a canonical example, reuse its existing components and tokens
   instead of hardcoding values or adding one-off patterns, and raise every
   deviation as a material user-owned decision.
9. Split independent subsystems and continue useful unblocked work when another
   subsystem has a partial blocker.
10. Apply the Feature Readiness Gate in
    `skills/pave/references/planning.md` before standard implementation work.
11. For standard implementation work, keep a checklist in the conversation by default.
    Create or update `.codex/pave/plans/` only when the optional repo runtime
    exists or the user explicitly asks for durable repo-local plans.
12. Ask once for implementation approval immediately before code or test edits
    unless the Small Change Fast Path applies.
13. Apply the Test Value Gate: name the concrete behavior or risk and the
    realistic defect each proposed test would catch. Execute only valuable
    behavioral tests with Red-Green-Review; otherwise use proportionate
    non-test verification and report residual risk.
14. Delegate bounded work through plugin role briefs or initialized adapter
    specialists only when useful.
15. Run declared verification commands before success claims.
16. For implementation, bug, refactor, and docs-sync work, load
    `skills/pave/references/memory.md` after verification. Promote only
    evidence-backed durable project knowledge, use a detailed troubleshooting
    record only for a qualifying incident, and report the Knowledge Delta or
    the reason nothing was promoted.
17. Write a final or blocked report under `.codex/pave/reports/` only when the
    optional repo runtime exists or the user explicitly asks for durable
    repo-local reports.
18. PAVE workflow and approval gates take precedence over instructions that
    optimize speed, terseness, or implementation size.
19. On Codex, use the PAVE phase prefixes defined in `skills/pave/SKILL.md`
    on `update_plan` steps so the local usage hook can measure phase duration
    and token deltas. This telemetry plan is not a substitute for the design,
    approval, testing, or verification gates.

## Decision and Approval Contract

`skills/pave/references/design.md` is the canonical decision workflow. Ask only
in-scope, material, user-owned questions that evidence and safe preservation
cannot settle. Show the scope map, decision ledger, and remaining blocking
count. Reconcile superseded decisions after corrections or scope changes. Do
not ask users to confirm technical facts.

Track scope intent, read-only discovery, design decisions, and write approval
separately. A design choice, clarification answer, or requirement update is not
write approval. Standard-work approval must explicitly authorize the surfaced
implementation boundary. Lack of write approval does not block safe read-only
discovery.

## Repo-Local File Guard

Do not create `AGENTS.md`, `CLAUDE.md`, `.codex/pave/`, or `docs/` unless the user invokes `/project-init` or explicitly asks to install PAVE runtime files in the repository.

## Specialist Agents

- `pave-product-manager`
- `pave-planner`
- `pave-ui-ux-designer`
- `pave-fullstack-developer`
- `pave-qa-engineer`
