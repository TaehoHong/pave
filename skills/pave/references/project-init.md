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
3. Split the work into two phases:
   - Runtime init: install or sync `AGENTS.md`, `CLAUDE.md`,
     `.codex/pave/`, `.claude/`, and companion adapter files from repo
     facts only.
   - Direction init: collect product direction, policy, architecture,
     operation, and verification decisions through user interview before
     writing product direction docs or runtime policy.
4. Audit existing docs before using them. Classify each relevant statement as
   `repo fact`, `user decision`, `unsupported assumption`, `stale statement`,
   or `open decision`. Do not promote unsupported assumptions or open
   decisions into durable docs.
5. Ask product, policy, deployment, design, architecture, and verification
   questions that cannot be answered from the repo.
6. Must interview the user about product direction, target users, positioning,
   product principles, technical constraints, design expectations, and
   onboarding context.
7. Before editing product direction docs, stop unless the conversation already
   contains explicit user decisions for every required decision domain. Repo
   facts, existing docs, inferred defaults, current implementation shape, and
   common industry defaults are not substitutes for user decisions. If
   required decisions are missing, produce only an interview agenda and
   decision gap register. Do not modify product direction docs.
8. Classify every required decision domain as `decided`,
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
9. Apply the Interview Quality Gate before generating docs.
10. Treat plugin installation and repo runtime setup as separate steps.
   For Codex, install the plugin through the marketplace first:
   `codex plugin marketplace add TaehoHong/pave --ref main`, then
   `codex plugin add pave@pave`. For Claude Code, install through the
   Claude marketplace first:
   `claude plugin marketplace add TaehoHong/pave`,
   then `claude plugin install pave@pave`. Do not present a skill prompt
   as the plugin installation method.
11. To apply PAVE runtime files to the repo, run
   `scripts/install.sh <repo>` with the right profile:
   - `default`: PAVE + Superpowers.
   - `full`: PAVE + Superpowers + gstack.
   - `none`: PAVE only for offline or unusual setups.
12. Use `scripts/init_repo.js <repo>` as the JavaScript automation
   helper when direct repo initialization is preferred.
13. For project-init, edits to product docs, `AGENTS.md`, `CLAUDE.md`, and
   PAVE runtime policy files require approval after the interview summary
   and before writing.
14. Fill `AGENTS.md` declared verification commands with real repo
   commands, or mark missing commands as setup gaps.
15. Create or update initial docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
16. Do not stop at copying templates. Populate the docs with clearly separated
    repo facts, user decisions, unresolved-after-asking questions, deferred
    decisions, not-applicable reasons, and setup gaps so future work keeps the
    same direction.
17. Run `scripts/doctor.js <repo> --companions <profile>`. Use
   `scripts/check_companions.sh` only when companion detection needs
   troubleshooting.
18. Report generated files, companion status, decision coverage, setup gaps,
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
