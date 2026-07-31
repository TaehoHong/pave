---
name: pave
description: Use when Codex is asked to initialize optional PAVE repo runtime files, implement a feature, fix a bug, modify functionality, analyze code, review changes, refactor, sync documentation, check status, run doctor checks, plan without edits, continue an approved task, coordinate bounded specialist subagents, track plans in conversation or optional .codex/pave plans, run verification, or produce final and blocked development reports.
---

# PAVE

PAVE means Plan, Approve, Verify, Execute. Use it as the top-level
session harness for software development work.

## Core Rules

1. PAVE runs from plugin-local instructions by default: this `SKILL.md`,
   `references/`, plugin commands, and role briefs.
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
8. Apply `references/fast-path.md` before standard planning. For an eligible
   small change, the user's concrete request is implementation approval. For
   other code or test edits, ask for one consolidated approval immediately
   before implementation. Scope intent authorizes read-only discovery but not
   writes; design answers settle behavior but are not write approval. After
   approval, do not ask routine per-item approval unless scope, safety,
   destructive action, credentials, or a material user-owned ambiguity changes.
9. Split independent subsystems, continue safe unblocked work, and distinguish
   justified extension boundaries from deferred future behavior.
10. Never claim completion without fresh verification evidence.
11. PAVE owns workflow and approval gates. Instructions that optimize speed,
    terseness, or implementation size do not waive those gates.

## Dependency Policy

- PAVE is standalone and does not invoke an external workflow plugin.
- Do not present a skill prompt as the plugin installation method.
- Do not add companion detection or plugin dependency fields.

## Request Routing

Classify the request:

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
- Bug: read `references/request-routing.md`, `references/debugging.md`, and
  `references/testing.md` before proposing a fix; after approval, use
  `references/execution-loop.md`, `references/review.md`, and
  `references/verification.md`.
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
`references/reporting.md`; read `references/memory.md` or `references/git.md`
only when the task requires memory capture or Git operations. Use assets from
`assets/` when initializing or syncing a repo.

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

Scripts are optional helpers. Read their `--help` output before use when
the requested action is sensitive or repo-specific.
