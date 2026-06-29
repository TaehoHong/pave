# Project Initialization

## Purpose

Create repo-local PAVE runtime files, companion checks, and a first
project knowledge set that preserves direction for future development and
onboarding. Normal feature work does not require this step.

## Trigger

Use when the user asks to initialize a project, set up AI-assisted
development, bootstrap a new repo, apply PAVE runtime files to a repo,
or configure PAVE with Superpowers or gstack.

## Steps

1. Read repo instructions and inspect the project tree.
2. Identify framework, package manager, test runner, build command,
   deployment shape, and existing docs.
3. Ask product, policy, deployment, design, architecture, and verification
   questions that cannot be answered from the repo.
4. Must interview the user about product direction, target users, positioning,
   product principles, technical constraints, design expectations, and
   onboarding context.
5. Apply the Interview Quality Gate before generating docs.
6. Treat plugin installation and repo runtime setup as separate steps.
   For Codex, install the plugin through the marketplace first:
   `codex plugin marketplace add TaehoHong/pave --ref main`, then
   `codex plugin add pave@pave`. For Claude Code, install through the
   Claude marketplace first:
   `claude plugin marketplace add TaehoHong/pave`,
   then `claude plugin install pave@pave`. Do not present a skill prompt
   as the plugin installation method.
7. To apply PAVE runtime files to the repo, run
   `scripts/install.sh <repo>` with the right profile:
   - `default`: PAVE + Superpowers.
   - `full`: PAVE + Superpowers + gstack.
   - `none`: PAVE only for offline or unusual setups.
8. Use `scripts/init_repo.js <repo>` as the JavaScript automation
   helper when direct repo initialization is preferred.
9. Fill `AGENTS.md` declared verification commands with real repo
   commands, or mark missing commands as setup gaps.
10. Create or update initial docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
11. Do not stop at copying templates. Populate the docs with concrete
    repo facts, user decisions, unresolved questions, and setup gaps so
    future work keeps the same direction.
12. Run `scripts/doctor.js <repo> --companions <profile>`. Use
   `scripts/check_companions.sh` only when companion detection needs
   troubleshooting.
13. Report generated files, companion status, unresolved decisions, and
    verification commands.

## Interview Quality Gate

- Do not treat catch-all answers like "all standard features", "backend only",
  "not applicable", "same as the reference product except one feature", or
  "you decide" as enough to create durable project direction.
- Ask follow-up questions until the answer is document-ready: target actors,
  first-version user flows, explicit non-goals, automation boundaries,
  security/data/moderation choices, architecture, deployment, and
  verification must be concrete or listed as unresolved.
- Prefer concrete follow-ups over broad prompts. Clarify primary domain
  objects, user roles, auth/session model, core workflows and APIs, data
  lifecycle, permissions, operational limits, storage, background jobs,
  integrations, package manager/runtime, deploy target, and first-version
  exclusions.
- If the user does not know yet, write the gap as an unresolved question. Do
  not turn vague answers into durable project facts.

## Outputs

- Root `AGENTS.md` and `CLAUDE.md`.
- Repo runtime under `.codex/pave/`.
- Claude Code command and role agents under `.claude/`.
- Initial project docs under `docs/`, including overview, roadmap,
  development rules, deployment rules, design rules, quality rules, and
  architecture.
- Doctor result and any companion troubleshooting result.

## Blocked Conditions

- The target repo path is unknown.
- Superpowers is required but cannot be detected or installed.
- The user explicitly requested the full profile and gstack is missing.
- Product, deployment, or design policy is required and the user has
  not provided it.
- Writing outside the sandbox requires approval and is denied.
