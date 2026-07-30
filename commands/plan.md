---
description: Create a PAVE implementation plan without editing source files.
---

# /plan

Plan only for the user's request.

Request:

```text
$ARGUMENTS
```

## Command Behavior

1. Do not edit code or tests.
2. Read the smallest useful context: plugin-local PAVE rules, repo
   instructions, relevant docs, nearby source files, and relevant tests.
3. Apply the Decision Triage, Evidence, Extensibility, Decision Ledger, and
   Interview Progress gates from `skills/pave/references/design.md`. Ask only
   material user-owned questions that block the current slice.
4. Produce an Implementation Plan with:
   - goal
   - scope map: in-scope, preserve-current-behavior, extension-boundary,
     deferred, out-of-scope, and blocked
   - current decision ledger and remaining blocking decision count
   - files likely to change
   - behavior to preserve
   - implementation steps
   - Test Value Gate result: protected behavior or risk for each proposed test,
     or proportionate verification and residual risk
   - out-of-scope items
   - approval gate before edits
5. If optional repo-local PAVE runtime exists or the user asks for durable
   planning, write the plan under `.codex/pave/plans/`. Otherwise keep it in
   the conversation.

## Output

Return the Implementation Plan and wait for approval before any code or test
edits.
