# /pave

Use PAVE: Plan, Approve, Verify, Execute.

## Command Behavior

1. Read `CLAUDE.md`, `AGENTS.md`, and `.codex/pave/config.md`.
2. Classify the request as project initialization, feature, bug, change,
   analysis, review, refactor, docs sync, continuation, or status.
3. Scan the repo before asking questions or editing.
4. Ask every product, policy, design, deployment, or verification question
   needed to remove ambiguity.
5. For implementation work, create or update a checklist plan in
   `.codex/pave/plans/`.
6. Ask once for implementation approval immediately before code or test edits.
7. Execute with Red-Green-Review after approval.
8. Delegate bounded work to `.claude/agents/` specialists only when useful.
9. Run declared verification commands before success claims.
10. Write a final or blocked report under `.codex/pave/reports/` when durable
    handoff is useful.

## Specialist Agents

- `pave-product-manager`
- `pave-planner`
- `pave-ui-ux-designer`
- `pave-fullstack-developer`
- `pave-qa-engineer`
