# /project-init

Run PAVE Project Initialization as optional repo-local runtime installation for
the current repository.

Use this command only when the project should keep durable PAVE runtime files,
starter docs, project direction, onboarding context, and Claude Code adapter
files in the repo. Normal plugin-only PAVE use does not require project
initialization before feature work begins.

## Command Behavior

1. Treat the request type as project initialization or repo runtime setup.
2. Do not route this request to feature, bug, review, refactor, docs sync, continuation, or status workflows.
3. Read existing repo instructions and inspect the project tree.
4. Identify framework, package manager, test runner, build command,
   deployment shape, and existing docs.
5. Ask product, policy, deployment, design, architecture, and verification
   questions that cannot be answered from the repo.
6. Must interview the user about product direction, target users, positioning,
   product principles, technical constraints, design expectations, and
   onboarding context.
7. Create or update the PAVE runtime files:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.codex/pave/`
   - `.claude/`
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
8. Do not stop at copying templates. Populate the docs with concrete repo
   facts, user decisions, unresolved questions, and setup gaps so future work
   keeps the same direction.
9. Fill `AGENTS.md` declared verification commands with real repo commands,
   or mark missing commands as setup gaps.
10. Run `scripts/doctor.js <repo> --companions <profile>` when the helper is
   available.
11. Report generated files, companion status, unresolved decisions, setup gaps,
   and verification commands.

## Scope Guard

This command must stop after project initialization. Do not implement product
features, fix bugs, refactor code, or sync unrelated documentation in the same
run.
