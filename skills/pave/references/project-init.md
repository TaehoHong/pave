# Project Initialization

## Contents

- [Purpose](#purpose)
- [Trigger](#trigger)
- [Steps](#steps)
- [Interview Quality Gate](#interview-quality-gate)
- [Project Design Gate](#project-design-gate)
- [Completion Criteria](#completion-criteria)
- [Outputs](#outputs)
- [Blocked Conditions](#blocked-conditions)
- [Scope Guard](#scope-guard)

## Purpose

Create repo-local PAVE runtime files and a deeply considered project charter
that preserves direction for future development and onboarding. Establish the
project-wide product, system, architecture, operation, design, and quality
constraints that future features must respect. Do not pre-design the detailed
behavior or implementation of individual features.

## Trigger

Use when the user asks for `/project-init`, explicitly asks to apply PAVE
runtime files to a repo, or asks to configure PAVE project instructions and
docs.

Treat the request only as project initialization or repo runtime setup. Do not
route it to feature, bug, review, refactor, docs sync, continuation, or status
workflows.

## Steps

1. Read repo instructions and inspect the project tree.
2. Identify framework, package manager, test runner, build command,
   deployment shape, existing docs, module boundaries, shared capabilities,
   canonical examples, and generated or excluded paths.
3. Split the work into two phases:
   - Runtime init: install or sync `AGENTS.md`, `CLAUDE.md`,
     `.codex/pave/`, `.claude/`, and adapter files from repo
     facts only.
   - Direction init: collect project-wide product direction, policy,
     architecture, operation, design, and verification decisions through user
     interview before writing product direction docs or runtime policy.
4. Audit existing docs before using them. Classify each relevant statement as
   `repo fact`, `user decision`, `unsupported assumption`, `stale statement`,
   or `open decision`. Do not promote unsupported assumptions or open
   decisions into durable docs.
5. Ask project-wide product, policy, deployment, design, architecture, and
   verification questions that cannot be answered from the repo. Do not ask
   for feature-level details merely to make initialization appear complete.
6. Must interview the user about product direction, target users, positioning,
   product principles, system boundaries, technical constraints, design
   expectations, operations, quality expectations, and onboarding context.
7. Before editing product direction docs, stop unless the conversation already
   contains explicit user decisions for every required project-level decision
   domain. Repo facts, existing docs, inferred defaults, current implementation
   shape, and common industry defaults are not substitutes for user decisions.
   If required project-level decisions are missing, produce only an interview
   agenda and decision gap register. Do not modify product direction docs.
8. Classify every required project-level decision domain as `decided`,
   `unresolved-after-asking`, `deferred-by-user`, or
   `not-applicable-with-reason`:
   - Product purpose, positioning, actors, and success measures
   - Project-wide capability map, priorities, and explicit non-goals
   - System context, domain ownership, module boundaries, dependency direction,
     and shared capabilities
   - Project-wide auth/session, API/realtime, and compatibility strategy
   - Data ownership, lifecycle, privacy, and security invariants
   - Project-wide moderation, safety, and payment/credits policy, if applicable
   - Background jobs, automation boundaries, integrations, and providers
   - Deployment, environments, observability, recovery, and operations model
   - Product-wide design principles, accessibility, and supported device classes
   - Quality strategy, project-level acceptance bar, and verification commands
   - Onboarding context and ownership of future product and architecture review
   - Explicit non-goals
9. Apply the Project Design Gate and Interview Quality Gate before generating
   docs.
10. Treat plugin installation and repo runtime setup as separate steps.
   For Codex, install the plugin through the marketplace first:
   `codex plugin marketplace add TaehoHong/pave --ref main`, then
   `codex plugin add pave@pave`. For Claude Code, install through the
   Claude marketplace first:
   `claude plugin marketplace add TaehoHong/pave`,
   then `claude plugin install pave@pave`. Do not present a skill prompt
   as the plugin installation method.
11. To apply PAVE runtime files to the repo, run
   `../../../scripts/install.sh <repo>`.
12. Use `../../../scripts/init_repo.js <repo>` as the JavaScript automation
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
   - `docs/07-codebase-guide.md`
16. Do not stop at copying templates. Populate the docs with clearly separated
    repo facts, user decisions, unresolved-after-asking questions, deferred
    decisions, not-applicable reasons, and setup gaps so future work keeps the
    same direction. Populate `docs/07-codebase-guide.md` from code evidence
    with module paths, shared owners, canonical symbols or examples,
    dependency rules, test locations, verification commands, excluded paths,
    and per-entry evidence paths.
17. Run `../../../scripts/doctor.js <repo>`.
18. Report generated files, decision coverage, setup gaps,
    and verification commands.

## Interview Quality Gate

- Do not treat catch-all answers like "all standard features", "backend only",
  "not applicable", "same as the reference product except one feature", or
  "you decide" as enough to create durable project direction.
- Ask follow-up questions until the project charter is document-ready: target
  actors, project-wide capability map, explicit non-goals, system boundaries,
  automation boundaries, cross-cutting security/data/moderation choices,
  architecture, deployment, design principles, and verification must be
  concrete or listed as unresolved.
- Capture a first-version capability inventory. For each capability, record
  only its actor, intended outcome, owning domain, system dependencies,
  cross-cutting project constraints, and unresolved project-level decisions.
  This inventory is a scope and ownership map, not a feature specification.
- Prefer concrete follow-ups over broad prompts. Clarify primary domain
  objects, user roles, project-wide auth/session and API strategy, representative
  core workflows needed to establish boundaries, data lifecycle invariants,
  operational limits, storage, background jobs, integrations, package
  manager/runtime, deploy target, and first-version exclusions.
- Only record a decision as unresolved after the agent has asked the user or
  the user explicitly chose to defer that decision. Do not skip the interview
  by marking missing decisions as unresolved. Do not turn vague answers into
  durable project facts.

## Project Design Gate

Use project initialization to make future feature work coherent, not to make
all future feature decisions in advance.

- Decide a subject during project initialization when it constrains multiple
  features, establishes a system or domain boundary, defines shared ownership,
  creates a cross-cutting product or technical invariant, or determines how the
  project is operated, reviewed, or verified.
- Defer a subject when it belongs to one feature, screen, endpoint, workflow,
  background job, or local implementation and can be decided later without
  changing a project-wide contract.
- Mark deferred subjects `deferred-to-feature-planning`. This status is the
  intended owner and timing of the decision, not an unresolved project-init
  gap and not permission for the agent to choose a default.
- Do not decide feature-specific layouts, interaction details, fields, payload
  shapes, state machines, permissions, edge cases, error behavior, data
  granularity, acceptance criteria, types, method signatures, call graphs,
  component trees, module edits, vertical slices, or test cases during project
  initialization.
- During implementation of a consequential feature, use the standard PAVE
  feature workflow to perform feature-level product review, system-impact
  review, program design, vertical slicing, acceptance design, and verification
  before code generation. Small eligible work may still use the PAVE fast path.

## Completion Criteria

- Runtime files are present or intentionally skipped.
- Repo facts are captured separately from user decisions.
- Required project-level decision domains are covered.
- Missing project-level decisions were asked, explicitly deferred, or marked
  not applicable with reason.
- Feature-level decisions are explicitly owned by feature planning rather than
  guessed or prematurely fixed during initialization.
- Product docs distinguish facts, decisions, assumptions, and unresolved
  questions.
- The codebase guide can route a typical task to the owning module, shared
  capability, canonical example, and narrow verification without a whole-repo
  source read.
- Declared verification commands are present and checked.

## Outputs

- Root `AGENTS.md` and `CLAUDE.md`.
- Repo runtime under `.codex/pave/`.
- Claude Code command and role agents under `.claude/`.
- Initial project docs under `docs/`, including overview, roadmap,
  development rules, deployment rules, design rules, quality rules, and
  architecture, plus the codebase guide.
- Doctor result.

## Blocked Conditions

- The target repo path is unknown.
- Product, deployment, or design policy is required and the user has
  not provided it.
- Writing outside the sandbox requires approval and is denied.

## Scope Guard

This workflow must stop after project initialization. Do not implement product
features, fix bugs, refactor code, or sync unrelated documentation in the same
run.
