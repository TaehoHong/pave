# Request Routing

## Purpose

Route each user request to the smallest safe PAVE workflow.

## Steps

1. Classify the request: project-init, feature, bug, change, analysis,
   review, refactor, docs-sync, continuation, or status.
2. Scan repo context before asking questions.
3. Apply `fast-path.md`. If every eligibility condition holds, state the
   expected files, substantive line count, and verification before writing,
   then skip standard planning and use the direct implementation request as
   approval.
4. Otherwise decide whether implementation planning is required.
5. For feature or behavior work, apply the Decision Triage and scope map from
   `design.md`. Ask only material user-owned questions that block the current
   slice.
6. Split independent subsystems. Report a partial blocker and continue
   unblocked in-scope work when doing so is useful and safe.
7. Track scope intent, read-only discovery, design decisions, and
   implementation approval as separate workflow states.
8. If the repo has only `.codex/ai-dev-harness/`, state legacy
   compatibility mode and propose migration when harness files need
   to change.

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
