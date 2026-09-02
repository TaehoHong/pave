---
description: Sync durable project docs from evidence and user decisions.
---

# /sync-docs

Sync project direction docs with current repo evidence and user decisions.

Use this after product, architecture, workflow, deployment, design, or quality
decisions change.

## Command Behavior

1. Read applicable repository instructions, then read and follow
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/memory.md` and
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/verification.md`.
2. Identify the subjects changed by current evidence or explicit user
   decisions. Select only the existing canonical documents that own those
   subjects, their linked sources, and the affected sections. Do not read every
   PAVE project document by default.
3. For code structure, shared ownership, conventions, verification, or
   codebase-guide changes, also read
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/context-retrieval.md`. Check
   only affected guide entries and their evidence paths, then scan the minimum
   additional code needed to resolve gaps.
4. Do not invent product, architecture, design, deployment, or quality rules.
   Ask only when a missing durable decision is required for the requested
   update; leave unrelated subjects unchanged.
5. Update documents only when supported by repository evidence or explicit
   user direction. Do not create a parallel documentation tree.
6. When the user explicitly requests history or troubleshooting backfill, also
   read and follow
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/history-backfill.md` and
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/git.md`.
7. Run the narrowest relevant markdown or repository verification.

Update `docs/07-codebase-guide.md` when verified changes alter module
boundaries, shared capabilities, canonical examples, dependency rules, test
locations, verification commands, or excluded paths. Do not rewrite unrelated
entries or refresh the guide from filenames alone.

## Output

Report changed documents, evidence used, unresolved candidates, verification
results, and a `Knowledge Delta` naming promoted or superseded knowledge or why
no promotion was warranted. Include the inspected Git range only when history
or troubleshooting backfill was requested. For a security, data-model,
shared-abstraction, or architecture rule change, report that human review is
required before merge.
