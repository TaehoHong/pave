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
3. Split the work into two phases:
   - Runtime init: install or sync `AGENTS.md`, `CLAUDE.md`,
     `.codex/pave/`, `.claude/`, and companion adapter files from repo
     facts only.
   - Direction init: collect product direction, policy, architecture,
     operation, and verification decisions through user interview before
     writing product direction docs or runtime policy.
4. Read existing repo instructions and inspect the project tree.
5. Identify framework, package manager, test runner, build command,
   deployment shape, and existing docs.
6. Audit existing docs before using them. Classify each relevant statement as
   `repo fact`, `user decision`, `unsupported assumption`, `stale statement`,
   or `open decision`. Do not promote unsupported assumptions or open
   decisions into durable docs.
7. Ask product, policy, deployment, design, architecture, and verification
   questions that cannot be answered from the repo.
8. Must interview the user about product direction, target users, positioning,
   product principles, technical constraints, design expectations, and
   onboarding context.
9. Before editing product direction docs, stop unless the conversation already
   contains explicit user decisions for every required decision domain. Repo
   facts, existing docs, inferred defaults, current implementation shape, and
   common industry defaults are not substitutes for user decisions. If
   required decisions are missing, produce only an interview agenda and
   decision gap register. Do not modify product direction docs.
10. Classify every required decision domain as `decided`,
    `unresolved-after-asking`, `deferred-by-user`, or
    `not-applicable-with-reason`:
   - Product actors and permissions
   - Auth/session model
   - Core user workflows
   - API protocol and realtime protocol choices
   - Data ownership and lifecycle
   - Privacy and security boundaries
   - Moderation and safety policy
   - Payment/credits policy, if applicable
   - Background jobs and automation boundaries
   - External integrations and providers
   - Deployment and operations model
   - Verification and acceptance criteria
   - Explicit non-goals
11. Apply the Interview Quality Gate before generating docs.
12. For project-init, edits to product docs, `AGENTS.md`, `CLAUDE.md`, and
    PAVE runtime policy files require approval after the interview summary
    and before writing.
13. Create or update the PAVE runtime files:
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
14. Do not stop at copying templates. Populate the docs with clearly separated
   repo facts, user decisions, unresolved-after-asking questions, deferred
   decisions, not-applicable reasons, and setup gaps so future work keeps the
   same direction.
15. Fill `AGENTS.md` declared verification commands with real repo commands,
   or mark missing commands as setup gaps.
16. Run `scripts/doctor.js <repo> --companions <profile>` when the helper is
   available.
17. Report generated files, companion status, decision coverage, setup gaps,
   and verification commands.

## Interview Quality Gate

- Do not treat catch-all answers like "all standard features", "backend only",
  "not applicable", "same as the reference product except one feature", or
  "you decide" as enough to create durable project direction.
- Ask follow-up questions until the answer is document-ready: target actors,
  first-version user flows, explicit non-goals, automation boundaries,
  security/data/moderation choices, architecture, deployment, and
  verification must be concrete or listed as unresolved.
- Capture a first-version feature inventory. For each feature, record the
  actor, trigger, happy path, edge cases, permissions, data rules, errors,
  per-feature policy decisions, acceptance criteria, and verification.
- Prefer concrete follow-ups over broad prompts. Clarify primary domain
  objects, user roles, auth/session model, core workflows and APIs, data
  lifecycle, permissions, operational limits, storage, background jobs,
  integrations, package manager/runtime, deploy target, and first-version
  exclusions.
- Only record a decision as unresolved after the agent has asked the user or
  the user explicitly chose to defer that decision. Do not skip the interview
  by marking missing decisions as unresolved. Do not turn vague answers into durable project facts.

## Completion Criteria

- Runtime files are present or intentionally skipped.
- Repo facts are captured separately from user decisions.
- Required decision domains are covered.
- Missing decisions were asked, explicitly deferred, or marked not applicable
  with reason.
- Product docs distinguish facts, decisions, assumptions, and unresolved
  questions.
- Declared verification commands are present and checked.

## Scope Guard

This command must stop after project initialization. Do not implement product
features, fix bugs, refactor code, or sync unrelated documentation in the same
run.
