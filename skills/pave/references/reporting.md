# Reporting

## Purpose

Leave concise evidence for completed or blocked work.

## Applies When

Read this reference only for:

- completed work that changed files or external state; or
- a task blocked after meaningful investigation or execution attempts.

Do not load it for read-only analysis, review, status, plan-only, or
verification-only requests. Those routes keep their own output contract.

## Final Report

Include:

- User-visible outcome.
- Files changed.
- Commands run and results.
- Plan path, when a durable plan exists.
- Subagent outcomes, when used.
- Human review focus: for standard work, name up to three key files, decisions,
  or residual risks a human should read.
- For security, data-model, shared-abstraction, or architecture changes, report
  `verified; human review required before merge` instead of unqualified
  completion.
- For implementation, bug, refactor, and documentation-sync work, a
  `Knowledge Delta`: promoted or superseded knowledge with target paths and
  evidence labels, an intentionally unpersisted candidate, or the reason no
  durable promotion was warranted.
- For a qualifying bug investigation, a `Troubleshooting Delta`: symptom,
  root-cause confidence, fix, regression guard, verification, record path, and
  canonical project docs updated. Never report an unproven hypothesis as the
  root cause.
- Codebase guide update when the change could affect durable module,
  shared-owner, convention, or verification knowledge, or why no update was
  warranted.

## Blocked Report

Include:

- Current state.
- Exact blocker.
- Evidence gathered.
- Attempts made.
- Required user input or external change.
- Any durable unresolved troubleshooting record written, or why the incomplete
  investigation was not useful enough to persist.
