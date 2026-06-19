---
name: pave
description: Use when Codex is asked to initialize a repository with PAVE runtime, configure Superpowers or gstack companion checks, implement a feature, fix a bug, modify functionality, analyze code, review changes, refactor, sync documentation, continue an approved task, coordinate bounded specialist subagents, create or update .codex/pave plans, run verification, or produce final and blocked development reports.
---

# PAVE

PAVE means Plan, Approve, Verify, Execute. Use it as the top-level
session harness for software development work.

## Core Rules

1. Read repo instructions first: root `AGENTS.md`, then nested
   `AGENTS.md` files that apply to touched paths, then `.codex/pave/config.md`
   when present.
2. If `.codex/pave/` is missing but `.codex/ai-dev-harness/` exists,
   treat the repo as legacy-compatible and offer migration before changing
   harness files.
3. Use Superpowers workflows when available. If unavailable, follow the
   same steps manually and state fallback mode.
4. Scan the repo before asking product, policy, design, deployment, or
   verification questions.
5. Ask every product or policy clarification during planning. Do not
   guess when behavior, UX, security, data handling, compatibility,
   rollout, or verification could change.
6. For code or test edits, ask for one consolidated approval immediately
   before implementation. After approval, do not ask routine per-item
   approval unless scope, safety, destructive action, credentials, or
   product/policy ambiguity changes.
7. Never claim completion without fresh verification evidence.

## Companion Policy

- Default install means PAVE + Superpowers.
- Full install means PAVE + Superpowers + gstack.
- Superpowers is required for default PAVE operation when available.
- gstack is optional unless the user explicitly asks for the full
  companion profile.
- Do not present a skill prompt as the plugin installation method.
- Do not invent plugin manifest dependency fields; use installer and
  doctor checks for companion status.

## Fast Path

Classify the request:

- Project initialization or repo runtime setup: read `references/project-init.md`.
- Feature or behavior change: read `references/planning.md`, then
  `references/execution-loop.md`.
- Bug: read `references/request-routing.md`, then use systematic
  debugging when available.
- Review: findings first, ordered by severity, with file and line
  evidence.
- Documentation sync: update docs only when evidence supports the change.
- Continuation: resume from the newest relevant plan in `.codex/pave/plans/`.

## Reference Routing

Load only the reference needed for the current step:

- Project setup: `references/project-init.md`
- Request classification: `references/request-routing.md`
- Planning and approval: `references/planning.md`
- Red-Green-Review execution: `references/execution-loop.md`
- Specialist delegation: `references/subagent-dispatch.md`
- Verification: `references/verification.md`
- Reporting: `references/reporting.md`
- Memory and wiki capture: `references/memory.md`
- Git and optional gstack policy: `references/git.md`

Use role briefs from `references/subagents/` when dispatching bounded
helpers. Use assets from `assets/` when initializing or syncing a repo.

## Scripts

- Codex plugin install: `codex plugin marketplace add TaehoHong/pave --ref main`,
  then `codex plugin add pave@pave`
- Claude Code plugin install:
  `claude plugin marketplace add TaehoHong/pave`,
  then `claude plugin install pave@pave`
- Local source plugin install helper: `scripts/install_plugin.sh`
- Repo runtime install: `scripts/install.sh <repo-path>`
- Check companions: `scripts/check_companions.sh`
- Initialize a repo with JavaScript: `scripts/init_repo.js <repo-path>`
- Check a repo: `scripts/doctor.js <repo-path>`
- Re-sync templates: `scripts/sync_template.js <repo-path>`

Scripts are optional helpers. Read their `--help` output before use when
the requested action is sensitive or repo-specific.
