# Subagent Dispatch

## Purpose

Use bounded specialist helpers without losing main-agent ownership.

## Roles

Use briefs from `references/subagents/`:

- `product-manager.md`
- `planner.md`
- `ui-ux-designer.md`
- `fullstack-developer.md`
- `qa-engineer.md`

## Rules

1. Dispatch only when the task is bounded and low-conflict.
2. Give each subagent explicit ownership and inputs.
3. Ask for evidence, not opinions.
4. Do not delegate final completion claims.
5. Summarize subagent outcomes in the active plan or final report.
6. Parallelize only independent scopes with no shared files, state, or ordering
   dependency. Keep related failures together until their root cause is known.
7. After subagents return, inspect every diff for overlap and run the integrated
   verification suite. A subagent's success report is not completion evidence.
8. Include the Test Value Gate in implementation and QA briefs. Do not accept
   tests justified only by coverage, convention, or test count.

## Blocked Conditions

- Write scopes overlap.
- Required context cannot be bounded.
- Subagent tooling is unavailable and the task requires delegation.
