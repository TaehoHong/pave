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
3. Ask product, policy, design, architecture, deployment, or verification
   questions that change the implementation.
4. Produce an Implementation Plan with:
   - goal
   - scope
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
