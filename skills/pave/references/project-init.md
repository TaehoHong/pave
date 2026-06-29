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
5. Treat plugin installation and repo runtime setup as separate steps.
   For Codex, install the plugin through the marketplace first:
   `codex plugin marketplace add TaehoHong/pave --ref main`, then
   `codex plugin add pave@pave`. For Claude Code, install through the
   Claude marketplace first:
   `claude plugin marketplace add TaehoHong/pave`,
   then `claude plugin install pave@pave`. Do not present a skill prompt
   as the plugin installation method.
6. To apply PAVE runtime files to the repo, run
   `scripts/install.sh <repo>` with the right profile:
   - `default`: PAVE + Superpowers.
   - `full`: PAVE + Superpowers + gstack.
   - `none`: PAVE only for offline or unusual setups.
7. Use `scripts/init_repo.js <repo>` as the JavaScript automation
   helper when direct repo initialization is preferred.
8. Fill `AGENTS.md` declared verification commands with real repo
   commands, or mark missing commands as setup gaps.
9. Create or update initial docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
10. Do not stop at copying templates. Populate the docs with concrete
    repo facts, user decisions, unresolved questions, and setup gaps so
    future work keeps the same direction.
11. Run `scripts/doctor.js <repo> --companions <profile>`. Use
   `scripts/check_companions.sh` only when companion detection needs
   troubleshooting.
12. Report generated files, companion status, unresolved decisions, and
    verification commands.

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
