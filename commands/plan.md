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
2. Read and follow
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/planning.md` and
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/testing.md`.
3. When the request states a behavior-changing outcome without
   implementation-ready requirements, or a material user-owned decision is
   unresolved, also read and follow
   `${CLAUDE_PLUGIN_ROOT}/skills/pave/references/design.md`.
4. Read applicable repository instructions and the smallest relevant docs,
   source files, and tests.

## Output

Return the plan and stop before any code or test edits.
