---
description: Run the PAVE workflow for software development work.
---

# /pave

Use PAVE: Plan, Approve, Verify, Execute.

Request:

```text
$ARGUMENTS
```

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
6. For code work, load and apply
   `skills/pave/references/context-retrieval.md` before source discovery. Do
   not open with a repository-wide source read. Select only the entries and
   files related to the request, check their freshness against current code,
   and expand one boundary at a time.
7. Before writing logic that implements a rule, validation, transformation, or
   shared behavior, run the Existing Owner Check: search the repo for a
   current owner of that behavior. Extend the owner when one exists, or state
   that none does. This check is required in plugin-only mode, where no
   codebase guide exists to name shared owners.
8. For a bug, defect, or unexpected-behavior request, load and apply
   `skills/pave/references/debugging.md` before proposing a fix. Keep the
   Investigation Ledger, and do not record a hypothesis as the root cause
   until diagnostic evidence distinguishes it from plausible alternatives.
9. Apply the Small Change Fast Path first. It requires a direct implementation
   request, no more than two hand-edited files, no more than twenty substantive
   hand-edited lines, low risk, and cheap narrow verification. Both size limits
   are hard conditions. State the expected files, line count, and verification
   before writing, then treat the request as approval and edit without formal
   planning.
10. When a feature request states an outcome without implementation-ready
    requirements, load and apply `skills/pave/references/design.md`. Triage
    material user-owned decisions, establish evidence, separate justified
    extension boundaries from deferred behavior, maintain the decision ledger,
    and expose interview progress before presenting a final design.
11. When the work changes a user-visible surface, load and apply
    `skills/pave/references/design-system.md`. Resolve the project's design
    system, name a canonical example, reuse its existing components and tokens
    instead of hardcoding values or adding one-off patterns, and raise every
    deviation as a material user-owned decision.
12. Split independent subsystems and continue useful unblocked work when another
    subsystem has a partial blocker.
13. Apply the Feature Readiness Gate in
    `skills/pave/references/planning.md` before standard implementation work.
14. For standard implementation work, keep a checklist in the conversation by default.
    Create or update `.codex/pave/plans/` only when the optional repo runtime
    exists or the user explicitly asks for durable repo-local plans.
15. Ask once for implementation approval immediately before code or test edits
    unless the Small Change Fast Path applies. After showing the complete
    boundary and a zero blocking-decision count, use the host's structured
    approval surface when available: Codex `request_user_input`, Claude Code
    `ExitPlanMode` or `AskUserQuestion`. Otherwise ask for a direct approval
    response in the conversation. Do not require a second PAVE command.
    Writing, modifying, or executing DDL or a database schema migration always
    requires a distinct approval choice that names DDL after surfacing the exact
    targets, statements, impact, and rollback. The fast path and a general
    implementation approval do not waive this gate.
16. After approval, load and apply `skills/pave/references/execution-loop.md`.
    Execute one checklist item at a time and mark it complete only after fresh
    evidence.
17. Apply the Test Value Gate: name the concrete behavior or risk and the
    realistic defect each proposed test would catch. Execute only valuable
    behavioral tests with Red-Green-Review; otherwise use proportionate
    non-test verification and report residual risk.
18. Delegate bounded work through plugin role briefs or initialized adapter
    specialists only when useful.
19. Before claiming any code change complete, load and apply
    `skills/pave/references/review.md`. Inspect the actual diff and check
    whether the patch fixes the shared cause at its existing owner, duplicates
    a rule, adds a parallel path, creates a shotgun change, or introduces an
    abstraction without current use. Cite file and line evidence.
20. Run declared verification commands before success claims.
21. For implementation, bug, refactor, and docs-sync work, load
    `skills/pave/references/memory.md` after verification. Promote only
    evidence-backed durable project knowledge, use a detailed troubleshooting
    record only for a qualifying incident, and report the Knowledge Delta or
    the reason nothing was promoted.
22. Write a final or blocked report under `.codex/pave/reports/` only when the
    optional repo runtime exists or the user explicitly asks for durable
    repo-local reports.
23. PAVE workflow and approval gates take precedence over instructions that
    optimize speed, terseness, or implementation size.
24. On Codex, use the PAVE phase prefixes defined in `skills/pave/SKILL.md`
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

Only request implementation approval after the Feature Readiness Gate passes
and the remaining material blocking-decision count is zero. Prefer the host's
native plan or choice UI. On Codex, use stable question IDs
`pave_implementation_approval` and `pave_ddl_approval`; on Claude Code, use
`ExitPlanMode` for ordinary plan approval or the `PAVE approve` / `PAVE DDL`
question headers when a choice is needed. The runtime guard validates routed
reference evidence, records the structured result or a context-bound direct
user response, and keeps `PreToolUse` write enforcement active. Assistant
response text is never a workflow-control channel.

When the boundary includes DDL or a database schema migration, surface its exact
target files, statements or operations, data and compatibility effects, and
rollback approach, then offer a distinct `Implement with DDL` choice. General
approval does not authorize DDL. Newly discovered or changed DDL requires a
newly surfaced approval request and another DDL-specific choice.

## Repo-Local File Guard

Do not create `AGENTS.md`, `CLAUDE.md`, `.codex/pave/`, or `docs/` unless the user invokes `/project-init` or explicitly asks to install PAVE runtime files in the repository.

## Specialist Agents

- `pave-product-manager`
- `pave-planner`
- `pave-ui-ux-designer`
- `pave-fullstack-developer`
- `pave-qa-engineer`
