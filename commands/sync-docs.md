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

## History and Troubleshooting Backfill

When the user asks to turn project history into durable knowledge:

1. State and inspect a bounded Git range. Prefer the newest release tag through
   `HEAD`; when no useful tag exists, default to at most 50 first-parent
   commits. Do not scan an unbounded repository history by default.
2. Use commits only as navigation. Read relevant diffs, tests, existing docs,
   and linked issues or pull requests before asserting a durable fact. A commit
   message alone is not enough evidence for a root cause or user-owned
   decision.
3. Classify candidates with PAVE evidence labels. Do not promote
   `agent-assumed` or `recommended-unconfirmed` explanations.
4. Deduplicate against existing canonical docs and
   `docs/troubleshooting/_index.md` when present. Update or supersede matching
   knowledge instead of creating another account of the same event.
5. Route current rules to their owning project docs. Preserve a detailed
   troubleshooting record only for a non-obvious, recurring, cross-boundary,
   operational, security, data-integrity, compatibility, or reliability issue.
6. For ambiguous historical rationale, report the candidate and missing
   evidence rather than inventing why a change was made.
7. Keep raw transcripts, private logs, credentials, secrets, and unrelated
   internal payloads out of durable docs.

## Output

Report changed docs, the inspected Git range, evidence used, promoted or
superseded knowledge, unresolved candidates, and any verification run.
