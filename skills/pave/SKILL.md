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
3. If `.codex/pave/` is missing, continue in plugin-only mode. Do not create repo-local runtime files unless the user runs `/project-init` or explicitly asks for durable repo-local PAVE files.
4. If `.codex/pave/` is missing but `.codex/ai-dev-harness/` exists,
   treat the repo as legacy-compatible and offer migration before changing
   harness files.
5. Follow PAVE's plugin-local design, debugging, risk-based testing,
   review, and verification workflows directly. Do not invoke an external
   workflow skill as part of PAVE operation.
6. Scan the repo before asking product, policy, design, deployment, or
   verification questions.
7. Ask every product or policy clarification during planning. Establish a
   feature inventory and per-feature policy decisions before implementation.
   Do not guess when behavior, UX, security, data handling, compatibility,
   rollout, or verification could change.
8. Apply `references/fast-path.md` before standard planning. For an eligible
   small change, the user's concrete request is implementation approval. For
   other code or test edits, ask for one consolidated approval immediately
   before implementation. After approval, do not ask routine per-item approval
   unless scope, safety, destructive action, credentials, or product/policy
   ambiguity changes.
9. Never claim completion without fresh verification evidence.

## Dependency Policy

- PAVE is standalone and does not invoke an external workflow plugin.
- Do not present a skill prompt as the plugin installation method.
- Do not add companion detection or plugin dependency fields.

## Fast Path

Classify the request:

- Obvious low-risk local edit: read `references/fast-path.md` and finish with
  narrow verification.
- Project initialization or optional repo runtime setup: read `references/project-init.md`.
- Doctor or status request: read `references/request-routing.md`, then report
  health or state without editing files.
- Plan-only request: read `references/planning.md` and stop before code or
  test edits.
- Feature or behavior change: read `references/design.md`,
  `references/planning.md`, then `references/execution-loop.md`.
- Bug: read `references/request-routing.md`, then
  `references/debugging.md` before proposing a fix.
- Review: findings first, ordered by severity, with file and line
  evidence.
- Documentation sync: update docs only when evidence supports the change.
- Verification-only request: read `references/verification.md` and do not edit
  source files.
- Continuation: resume from the newest relevant repo-local plan when
  `.codex/pave/plans/` exists; otherwise continue from the conversation state.

## Reference Routing

Load only the reference needed for the current step:

- Project setup: `references/project-init.md`
- Request classification: `references/request-routing.md`
- Small low-risk edits: `references/fast-path.md`
- Intent and design: `references/design.md`
- Planning and approval: `references/planning.md`
- Root-cause debugging: `references/debugging.md`
- Test value: `references/testing.md`
- Red-Green-Review execution: `references/execution-loop.md`
- Code review: `references/review.md`
- Specialist delegation: `references/subagent-dispatch.md`
- Verification: `references/verification.md`
- Reporting: `references/reporting.md`
- Memory and wiki capture: `references/memory.md`
- Git policy: `references/git.md`

Use role briefs from `references/subagents/` when dispatching bounded
helpers. Use assets from `assets/` when initializing or syncing a repo.

## Scripts

- Codex plugin install: `codex plugin marketplace add TaehoHong/pave --ref main`,
  then `codex plugin add pave@pave`
- Claude Code plugin install:
  `claude plugin marketplace add TaehoHong/pave`,
  then `claude plugin install pave@pave`
- Local source plugin install helper: `scripts/install_plugin.sh`
- Optional repo runtime install: `scripts/install.sh <repo-path>`
- Initialize a repo with JavaScript: `scripts/init_repo.js <repo-path>`
- Check a repo: `scripts/doctor.js <repo-path>`
- Re-sync templates: `scripts/sync_template.js <repo-path>`

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
