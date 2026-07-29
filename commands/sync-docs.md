---
description: Sync durable project docs from evidence and user decisions.
---

# /sync-docs

Sync project direction docs with current repo evidence and user decisions.

Use this after product, architecture, workflow, deployment, design, or quality
decisions change.

## Command Behavior

1. Read existing project docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
   - `docs/07-codebase-guide.md`
2. For code structure, shared ownership, conventions, or verification changes,
   follow `skills/pave/references/context-retrieval.md`. Check only affected
   guide entries and their evidence paths, then scan the minimum additional
   code needed to resolve gaps.
3. Do not invent product decisions, architecture, design rules, deployment
   rules, or quality gates.
4. Ask the user when a durable decision is missing.
5. Update docs only when supported by repo evidence or explicit user direction.
6. Run a lightweight markdown or repo check when available.

Update `docs/07-codebase-guide.md` when verified changes alter module
boundaries, shared capabilities, canonical examples, dependency rules, test
locations, verification commands, or excluded paths. Do not rewrite unrelated
entries or refresh the guide from filenames alone.

## Output

Report changed docs, evidence used, unresolved questions, and any verification
run.
