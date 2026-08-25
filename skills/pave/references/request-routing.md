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

## Guarded Route State

Reference reads are evidence, not route selection. Once inspection settles the
classification and fast-path eligibility, declare the route explicitly:

Resolve the plugin root from the loaded PAVE `SKILL.md` (two directories up),
then invoke the guard by absolute path:

```sh
node "<pave-plugin-root>/scripts/workflow-guard.js" route <fast|bug|feature>
```

Do not assume `CLAUDE_PLUGIN_ROOT` or `PLUGIN_ROOT` is exported into the agent's
shell; those variables are hook-runner details.

Declare a different route to promote or switch without losing investigation or
reference evidence. Use `route reset` to clear only the selected route and any
approval derived from it. A route change always revokes prior implementation
and DDL approval because that approval belonged to the previous boundary.

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
