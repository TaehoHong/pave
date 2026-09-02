# Project Initialization

## Contents

- [Purpose](#purpose)
- [Trigger](#trigger)
- [Steps](#steps)
- [Existing Documentation Discovery](#existing-documentation-discovery)
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
4. On an existing repository, run the Existing Documentation Discovery
   inventory before the interview and before writing any doc. Link the PAVE
   docs to documentation the project already has instead of recreating it.
5. Audit existing docs before using them. Classify each relevant statement as
   `repo fact`, `user decision`, `unsupported assumption`, `stale statement`,
   or `open decision`. Do not promote unsupported assumptions or open
   decisions into durable docs.
6. Ask project-wide product, policy, deployment, design, architecture, and
   verification questions that cannot be answered from the repo or from a
   discovered document. Do not ask for feature-level details merely to make
   initialization appear complete.
7. Must interview the user about product direction, target users, positioning,
   product principles, system boundaries, technical constraints, design
   expectations, operations, quality expectations, and onboarding context.
8. Before editing product direction docs, stop unless the conversation already
   contains explicit user decisions for every required project-level decision
   domain. Repo facts, existing docs, inferred defaults, current implementation
   shape, and common industry defaults are not substitutes for user decisions.
   If required project-level decisions are missing, produce only an interview
   agenda and decision gap register. Do not modify product direction docs.
9. Classify every required project-level decision domain as `decided`,
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
10. Apply the Project Design Gate and Interview Quality Gate before generating
   docs.
11. Treat plugin installation and repo runtime setup as separate steps.
   For Codex, install the plugin through the marketplace first:
   `codex plugin marketplace add TaehoHong/pave --ref main`, then
   `codex plugin add pave@pave`. For Claude Code, install through the
   Claude marketplace first:
   `claude plugin marketplace add TaehoHong/pave`,
   then `claude plugin install pave@pave`. Do not present a skill prompt
   as the plugin installation method.
12. To apply PAVE runtime files to the repo, run
   `../../../scripts/install.sh <repo>`.
13. Use `../../../scripts/init_repo.js <repo>` as the JavaScript automation
   helper when direct repo initialization is preferred. It reports existing
   documentation it detects; treat that list as a discovery hint, not the
   complete inventory.
14. For project-init, edits to product docs, `AGENTS.md`, `CLAUDE.md`, and
   PAVE runtime policy files require approval after the interview summary
   and before writing.
15. Fill `AGENTS.md` declared verification commands with real repo
   commands, or mark missing commands as setup gaps.
16. Create or update initial docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
   - `docs/07-codebase-guide.md`
17. Do not stop at copying templates. Populate the docs with clearly separated
    repo facts, user decisions, unresolved-after-asking questions, deferred
    decisions, not-applicable reasons, and setup gaps so future work keeps the
    same direction. Populate `docs/07-codebase-guide.md` from code evidence
    with module paths, shared owners, canonical symbols or examples,
    dependency rules, test locations, verification commands, excluded paths,
    and per-entry evidence paths.
18. Fill the `Linked Sources` table of each doc that a discovered document
    owns, and leave it empty when nothing was discovered for that subject.
19. Confirm that the initialization helper completed its built-in runtime
    validation.
20. Report generated files, linked existing documentation, decision coverage,
    setup gaps, and verification commands.

## Existing Documentation Discovery

An existing repository usually already documents part of what PAVE docs cover.
Find that documentation, link it, and keep it as the source of truth. Creating a
second copy of a subject the project already documents is a defect, not
initialization.

### Inventory

Search the repository for documentation that already owns a PAVE doc subject:

- documentation roots outside `docs/`, such as `doc/`, `documentation/`,
  `guide/`, `handbook/`, `wiki/`, `.wiki/`, `rfcs/`, `adr/`, `decisions/`,
  `design/`, `incidents/`, `postmortems/`, `runbooks/`, `troubleshooting/`,
  and `.github/`;
- root and package-level `README`, `CONTRIBUTING`, `ARCHITECTURE`, `SECURITY`,
  `CHANGELOG`, and `CODEOWNERS` files;
- design system artifacts: style guides, design token or theme files, CSS
  variable definitions, shared component library directories, component
  stories, and design spec or screenshot folders;
- executable documentation: CI workflow files, package scripts, lint and
  formatter configuration, deployment manifests, and environment templates;
- external references already linked from repo files: team wikis, issue
  trackers, specification sites, and design tool links.

For each discovered document record the path or URL, the PAVE doc subject it
owns, and how recently it changed. One document may own several subjects.

### Link Contract

For every discovered document that owns a subject:

1. Keep the discovered document canonical. Do not copy its content into a PAVE
   doc, rewrite it, move it, or delete it.
2. Record it in the owning PAVE doc under `Linked Sources` with its path or URL,
   the subject it owns, what it does not cover, and its evidence paths.
3. Keep only PAVE-specific direction in the PAVE doc body: the decisions the
   linked document leaves open, and the project-level constraints it lacks.
4. When a discovered document contradicts current repo evidence, link it and
   record the contradiction as a `stale statement`. Do not restate it as fact.
5. When two documents own the same subject, link both and ask the user which is
   canonical. Competing sources of truth are a material user-owned decision.
6. Treat an external link as a pointer only. Durable facts still require repo
   evidence or an explicit user decision.

When the project keeps documentation in a different root, present both options
before writing: link that root from `docs/`, or adopt it as the docs location.
The user owns that choice. Never create a parallel duplicate tree silently.

### Interview Reduction

A decision domain a discovered document already answers is a `repo fact`.
Confirm it in the interview summary instead of asking it as an open question,
and interview only the domains no discovered document covers. Discovery narrows
the interview; it never replaces a required user decision that no document
settles.

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
- Existing project documentation is inventoried, linked from the PAVE doc that
  owns each subject, and left as the source of truth rather than duplicated.
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
- No blank troubleshooting directory. Create one lazily only after a verified
  high-signal incident passes the durable knowledge promotion gate.
- Linked-source entries pointing at the project's existing documentation.
- Initialization validation result.

## Blocked Conditions

- The target repo path is unknown.
- Two documents own the same subject and the user has not chosen the canonical
  one.
- Product, deployment, or design policy is required and the user has
  not provided it.
- Writing outside the sandbox requires approval and is denied.

## Scope Guard

This workflow must stop after project initialization. Do not implement product
features, fix bugs, refactor code, or sync unrelated documentation in the same
run.
