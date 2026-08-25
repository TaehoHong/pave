---
name: pave
description: Use when the agent is asked to initialize optional PAVE repo runtime files, implement a feature, fix a bug, modify functionality, analyze code, review changes, refactor, sync documentation, check status, run doctor checks, plan without edits, continue an approved task, coordinate bounded specialist subagents, track plans in conversation or optional .codex/pave plans, run verification, or produce final and blocked development reports.
---

# PAVE

PAVE means Plan, Approve, Verify, Execute. Use it as the top-level
session harness for software development work.

## Core Rules

1. PAVE runs from plugin-local instructions by default: this `SKILL.md`,
   `references/`, plugin commands, and role briefs.
   Supporting files under `references/` are not separately registered skills.
   Read them with the host's file-reading tool, resolved relative to this
   `SKILL.md`; never derive a `Skill` call such as `pave:execution-loop` or
   retry the already-loaded entrypoint as `pave`.
2. Read repo instructions when present: root `AGENTS.md`, nested `AGENTS.md`
   files that apply to touched paths, `CLAUDE.md` for Claude Code, then
   `.codex/pave/config.md` when present.
   For code work, read `docs/07-codebase-guide.md` when present and follow
   `references/context-retrieval.md` before source discovery.
3. If `.codex/pave/` is missing, continue in plugin-only mode. Do not create repo-local runtime files unless the user runs `/project-init` or explicitly asks for durable repo-local PAVE files.
4. If `.codex/pave/` is missing but `.codex/ai-dev-harness/` exists,
   treat the repo as legacy-compatible and offer migration before changing
   harness files.
5. Follow PAVE's plugin-local design, debugging, risk-based testing,
   review, and verification workflows directly. Do not invoke an external
   workflow skill as part of PAVE operation.
6. Scan the repo before asking product, policy, design, deployment, or
   verification questions.
7. For a feature request that states an outcome without implementation-ready
   requirements, apply the Decision Triage, Evidence, Extensibility, Decision
   Ledger, and Interview Progress gates in `references/design.md`. Ask only
   material user-owned questions that block the current slice. Technical facts
   come from repo or authoritative external evidence, not user confirmation.
8. For work that changes a user-visible surface, apply
   `references/design-system.md`. Resolve the project's design system from
   durable design policy, repo design artifacts, or the nearest canonical
   component, reuse its existing components and tokens, and treat every
   deviation as a material user-owned decision.
9. Apply `references/fast-path.md` before standard planning. For an eligible
   small change, the user's concrete request is implementation approval. For
   other code or test edits, ask for one consolidated approval immediately
   before implementation. Scope intent authorizes read-only discovery but not
   writes; design answers settle behavior but are not write approval. After
   approval, do not ask routine per-item approval unless scope, safety,
   destructive action, credentials, or a material user-owned ambiguity changes.
   Writing, modifying, or executing DDL or a database schema migration always
   requires explicit DDL approval for the surfaced targets, statements, impact,
   and rollback. General implementation approval and the fast path do not waive
   this gate; one response may grant both approvals when both scopes are shown.
   When the workflow guard is active, explicitly declare the selected route
   after classification. Resolve the plugin root from this loaded `SKILL.md`
   (two directories up), then run
   `node "<pave-plugin-root>/scripts/workflow-guard.js" route
   <fast|bug|feature>` with the absolute path. Agent shells must not assume
   plugin-root environment variables are exported. Reading a reference records
   evidence only and never selects a route. Change routes with the same command;
   use `route reset` to clear only the route and approval state while preserving
   investigation and reference evidence.
10. Split independent subsystems, continue safe unblocked work, and distinguish
    justified extension boundaries from deferred future behavior.
11. Before writing logic that implements a rule, validation, transformation,
    or other reusable behavior, run the Existing Owner Check in
    `references/context-retrieval.md` and record `owner-found`,
    `owner-absent`, or `owner-rejected`. This applies in plugin-only mode,
    where no codebase guide names shared owners. Extend a found owner instead
    of adding a parallel implementation, and treat `owner-rejected` as a
    material decision rather than an implementation detail.
12. Never claim completion without fresh verification evidence.
13. PAVE owns workflow and approval gates. Instructions that optimize speed,
    terseness, or implementation size do not waive those gates.
14. On Codex, when `update_plan` is available, expose phase telemetry by
    prefixing each plan step with exactly one of `[PAVE:inspect]`,
    `[PAVE:plan]`, `[PAVE:approval]`, `[PAVE:execute]`, `[PAVE:verify]`, or
    `[PAVE:report]`. Keep the task-specific outcome after the prefix, move the
    matching step to `in_progress` at each phase boundary, and mark every step
    completed immediately before the final response. Leave
    `[PAVE:approval]` in progress while waiting for implementation approval.
    Do not add these markers on non-Codex hosts.
15. For implementation, bug, refactor, and documentation-sync work, evaluate
    the verified result against `references/memory.md` before final reporting.
    Promote only durable, evidence-backed project knowledge; never turn raw
    task history, unproven hypotheses, or reversible agent assumptions into
    canonical documentation.
16. In hosts that load `hooks/hooks.json`, the workflow guard records only
    session-scoped gate evidence. After the surfaced boundary has zero blocking
    decisions, prefer a host-native structured approval: Codex
    `request_user_input`, Claude Code `AskUserQuestion` in default mode, or
    `ExitPlanMode` when already in plan mode.
    A direct conversational approval is valid only while the structured PAVE
    approval plan step is pending. The guard validates the explicitly declared
    route plus its reference evidence and enforces the resulting state in
    `PreToolUse`; assistant response text and reference reads are not
    workflow-control channels. The guard is defense in depth and does not
    replace semantic decision triage, review, or verification. It blocks
    unambiguous workflow bypasses; it is not a general shell or SQL sandbox and
    must not replace host permissions with exhaustive command parsing.
17. For Codex `request_user_input`, use question ID
    `pave_implementation_approval`, or `pave_ddl_approval` when the surfaced
    boundary includes DDL, with `Implement (Recommended)` / `Implement with DDL
    (Recommended)` and `Revise plan` choices. For Claude `AskUserQuestion`, use the equivalent `PAVE
    approve` or `PAVE DDL` header. A successful `ExitPlanMode` records standard
    approval only when Claude is already in plan mode. DDL always requires the
    DDL-specific choice. After approval, read the file
    `references/execution-loop.md` and execute the approved scope.

## Dependency Policy

- PAVE is standalone and does not invoke an external workflow plugin.
- Do not present a skill prompt as the plugin installation method.
- Do not add companion detection or plugin dependency fields.

## Request Routing

Classify the request:

When hooks are active, reference reads may happen during inspection, but they
do not choose the route. After the classification and fast-path eligibility
check are settled, declare `fast`, `bug`, or `feature` with the route command
from Core Rule 9 before requesting approval or editing.

- Obvious low-risk local edit: read `references/fast-path.md`,
  `references/testing.md`, and `references/verification.md`.
- Project initialization or optional repo runtime setup: read `references/project-init.md`.
- Doctor or status request: read `references/request-routing.md`, then report
  health or state without editing files.
- Plan-only request: read `references/design.md`, `references/testing.md`, and
  `references/planning.md`; stop before code or test edits.
- Feature or behavior change: read `references/design.md`,
  `references/testing.md`, `references/planning.md`,
  `references/execution-loop.md`, `references/review.md`, and
  `references/verification.md` as the work reaches each step.
- Bug: read `references/request-routing.md`, `references/debugging.md`,
  `references/testing.md`, and `references/memory.md` before proposing a fix;
  after approval, use `references/execution-loop.md`, `references/review.md`,
  and `references/verification.md`.
- UI or UX work: additionally read `references/design-system.md` before editing
  a user-visible surface and before claiming that change complete. This applies
  to any request type, including a fast-path edit and the user-visible part of a
  feature or bug fix.
- Review: read `references/review.md` and, when tests changed,
  `references/testing.md`; report findings first with file and line evidence.
- Documentation sync: update docs only when evidence supports the change; read
  `references/context-retrieval.md` when codebase-guide ownership or freshness
  is involved.
- Verification-only request: read `references/verification.md` and do not edit
  source files.
- Continuation: resume from the newest relevant repo-local plan when
  `.codex/pave/plans/` exists; otherwise continue from the conversation state.

Before dispatching bounded helpers, read `references/subagent-dispatch.md` and
use role briefs from `references/subagents/`. Before final reporting, read
`references/reporting.md`; for mutating work also read `references/memory.md`
and report the resulting Knowledge Delta or the reason no promotion was
warranted. Read `references/git.md` only when the task requires Git operations.
Use assets from `assets/` when initializing, syncing, or creating a durable
troubleshooting record.

## Scripts

- Codex plugin install: `codex plugin marketplace add TaehoHong/pave --ref main`,
  then `codex plugin add pave@pave`
- Claude Code plugin install:
  `claude plugin marketplace add TaehoHong/pave`,
  then `claude plugin install pave@pave`
- Local source plugin install helper: `../../scripts/install_plugin.sh`
- Optional repo runtime install: `../../scripts/install.sh <repo-path>`
- Initialize a repo with JavaScript: `../../scripts/init_repo.js <repo-path>`
- Check a repo: `../../scripts/doctor.js <repo-path>`
- Re-sync templates: `../../scripts/sync_template.js <repo-path>`
- Declare or reset guarded routing: resolve this file's plugin root, then run
  `node "<pave-plugin-root>/scripts/workflow-guard.js" route <fast|bug|feature|reset>`

## Commands

- `/pave`: default workflow router.
- `/project-init`: optional repo-local direction and runtime initialization.
- `/doctor`: PAVE install, runtime, and docs health check.
- `/status`: read-only project and PAVE state summary.
- `/plan`: plan only; do not edit code or tests.
- `/verify`: run verification only; do not modify source files.
- `/sync-docs`: update project direction docs from evidence and user decisions.
- `/token-save`: one-off token-conscious contract; normal use is token-save
  mode in `.codex/pave/config.md` plus `/pave`.
- `$pave:usage`: Codex-only local PAVE phase timing and token statistics.

Scripts are optional helpers. Read their `--help` output before use when
the requested action is sensitive or repo-specific.
