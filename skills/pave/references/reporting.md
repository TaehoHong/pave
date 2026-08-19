# Reporting

## Purpose

Leave concise evidence for completed or blocked work.

## Final Report

Include:

- User-visible outcome.
- Files changed.
- Commands run and results.
- Plan path.
- Subagent outcomes when used.
- Human review focus: for standard work, name up to three key files, decisions,
  or residual risks a human should read.
- For security, data-model, shared-abstraction, or architecture changes, report
  `verified; human review required before merge` instead of unqualified
  completion.
- A `Knowledge Delta`: promoted or superseded knowledge with target paths and
  evidence labels, an intentionally unpersisted candidate, or the reason no
  durable promotion was warranted.
- For a qualifying bug investigation, a `Troubleshooting Delta`: symptom,
  root-cause confidence, fix, regression guard, verification, record path, and
  canonical project docs updated. Never report an unproven hypothesis as the
  root cause.
- Codebase guide update, or why the verified change did not affect durable
  module, shared-owner, convention, or verification knowledge.

## Blocked Report

Include the exact `<!-- PAVE_BLOCKED -->` comment when a runtime-enforced PAVE
session must stop with incomplete implementation. Use it only for a genuine
blocker, never to bypass review or verification.

Include:

- Current state.
- Exact blocker.
- Evidence gathered.
- Attempts made.
- Required user input or external change.
- Any durable unresolved troubleshooting record written, or why the incomplete
  investigation was not useful enough to persist.
