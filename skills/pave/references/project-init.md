# Project Initialization

## Purpose

Create repo-local PAVE runtime files and a first project knowledge
set before feature work begins.

## Trigger

Use when the user asks to initialize a project, set up AI-assisted
development, bootstrap a new repo, or install PAVE into a repo.

## Steps

1. Read repo instructions and inspect the project tree.
2. Identify framework, package manager, test runner, build command,
   deployment shape, and existing docs.
3. Ask product, policy, deployment, design, and verification
   questions that cannot be answered from the repo.
4. Run `scripts/init_repo.py <repo>` or copy equivalent assets.
5. Fill `AGENTS.md` declared verification commands with real repo
   commands, or mark missing commands as setup gaps.
6. Create or update initial docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
7. Run `scripts/doctor.py <repo>` and fix missing required files.
8. Report generated files, unresolved decisions, and verification
   commands.

## Outputs

- Root `AGENTS.md` and optional `CLAUDE.md`.
- Repo runtime under `.codex/pave/`.
- Initial project docs under `docs/`.
- Doctor result.

## Blocked Conditions

- The target repo path is unknown.
- Product, deployment, or design policy is required and the user has
  not provided it.
- Writing outside the sandbox requires approval and is denied.
