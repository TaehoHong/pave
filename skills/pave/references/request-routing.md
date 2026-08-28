# Request Routing

## Purpose

Route each user request to the smallest safe PAVE workflow.

## Steps

1. Classify the request: project-init, feature, bug, change, analysis,
   review, refactor, docs-sync, continuation, or status.
2. Scan repo context before asking questions.
3. Apply the Small Change Fast Path. If every eligibility condition holds,
   state the expected files, substantive line count, and verification before
   writing, then skip standard planning and use the direct implementation
   request as approval.
4. Otherwise decide whether implementation planning is required.
5. For feature or behavior work, apply the PAVE Decision Triage and scope map.
   Ask only material user-owned questions that block the current slice.
6. Split independent subsystems. Report a partial blocker and continue
   unblocked in-scope work when doing so is useful and safe.
7. Track scope intent, read-only discovery, design decisions, and
   implementation approval as separate workflow states.
8. If the repo has only `.codex/ai-dev-harness/`, state legacy
   compatibility mode and propose migration when harness files need
   to change.

## Implementation Contract Summary

Routing selects the workflow instructions; it does not grant tool permission or
implementation approval. Before standard implementation, surface the canonical
Implementation Contract from `SKILL.md`. For the fast path, surface its compact
equivalent: expected files, line count, observable result, risks, and
verification.

Obtain renewed approval before acting when the expected files, external
operations, material capabilities or risks, verification strategy, or
observable behavior changes materially. Host permissions and sandboxing own
technical execution control; PAVE does not infer command effects from tool,
framework, extension, or command names.

## Outputs

- Request type.
- Required workflow.
- Plan requirement.
- Scope map, blocking decision count, and approval state when planning is
  required.
- Subagent recommendation when useful.

## Blocked Conditions

- Target area cannot be identified.
- Goals conflict.
- A required product decision is missing.
