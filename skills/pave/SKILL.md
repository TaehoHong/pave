---
name: pave
description: Use when the agent is asked to initialize optional PAVE repo runtime files, implement a feature, fix a bug, modify functionality, analyze code, review changes, refactor, sync documentation, check status, plan without edits, continue an approved task, coordinate bounded specialist subagents, track plans in conversation or optional .codex/pave plans, run verification, or produce final and blocked development reports.
---

# PAVE

PAVE means Plan, Approve, Verify, Execute. Use it as the top-level
session harness for software development work.

## Core Rules

1. PAVE runs from plugin-local instructions by default: this `SKILL.md`,
   `references/`, plugin commands, and role briefs.
   Supporting files under `references/` are not separately registered skills.
   Read them completely with the host's file-reading tool, resolved relative
   to this `SKILL.md`. When the host has no complete-file read tool, read the
   file in bounded chunks until EOF.
   Never derive a `Skill` call such as `pave:execution-loop` or retry the
   already-loaded entrypoint as `pave`.
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
9. Apply `references/fast-path.md` before standard planning. An eligible small
   change uses its compact approval flow. For all other code or test edits,
   read `references/approval.md` only after the implementation boundary is
   ready and immediately before requesting approval. Never treat read-only
   discovery or a design answer as write approval, and never write or execute
   DDL without the distinct approval defined there. After approval, read
   `references/execution-loop.md` and execute only the approved scope.
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
14. For implementation, bug, refactor, and documentation-sync work, evaluate
    the verified result against `references/memory.md` before final reporting.
    Promote only durable, evidence-backed project knowledge; never turn raw
    task history, unproven hypotheses, or reversible agent assumptions into
    canonical documentation.
## Dependency Policy

- PAVE is standalone and does not invoke an external workflow plugin.
- Do not present a skill prompt as the plugin installation method.
- Do not add companion detection or plugin dependency fields.

## Request Routing

Classify the request:

- Obvious low-risk local edit: read `references/fast-path.md`,
  `references/testing.md`, and `references/verification.md`.
- Project initialization or optional repo runtime setup: read `references/project-init.md`.
- Plugin installation or local development: read `../../README.md` and inspect
  referenced script help only when the request requires running a script.
- Status request: read `../../commands/status.md`, then report state without
  editing files.
- Plan-only request: read `references/design.md`, `references/testing.md`, and
  `references/planning.md`; stop before code or test edits.
- Feature or behavior change: read `references/design.md`,
  `references/testing.md`, `references/planning.md`,
  `references/execution-loop.md`, `references/review.md`, and
  `references/verification.md` as the work reaches each step.
- Bug: read `references/debugging.md`, `references/testing.md`, and
  `references/memory.md` before proposing a fix; after approval, use
  `references/execution-loop.md`, `references/review.md`, and
  `references/verification.md`.
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
use role briefs from `references/subagents/`. Read `references/reporting.md`
only for a mutating completion or a task blocked after meaningful attempts.
Read-only analysis, review, status, plan-only, and verification-only requests
follow their route-specific output without loading the reporting reference.
For mutating work also read `references/memory.md` and report the resulting
Knowledge Delta or the reason no promotion was warranted. Read
`references/git.md` only when the task requires Git operations. Use assets from
`assets/` when initializing, syncing, or creating a durable troubleshooting
record.
