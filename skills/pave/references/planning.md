# Planning

## Purpose

Produce a decision-complete checklist plan before implementation.

## Steps

1. Summarize current behavior and desired behavior.
2. Choose the smallest coherent implementation path.
3. Split work into checklist items small enough for one
   Red-Green-Review loop.
4. Assign tiers:
   - `T1 Scaffold`: structure, types, wiring.
   - `T2 Core Logic`: domain rules and algorithms.
   - `T3 Integration`: DB, API, filesystem, external systems.
   - `T4 Surface/E2E`: handlers, UI, CLI, user flows.
5. Attach expected tests or verification commands.
6. Resolve every product or policy ambiguity, including small details.
7. List out-of-scope work.
8. Ask once for consolidated approval immediately before code or
   test edits.

## Outputs

- Plan under `.codex/pave/plans/`.
- Tiered checklist.
- Verification strategy.
- Approval gate.

## Blocked Conditions

- Success criteria are unclear.
- No meaningful verification strategy exists.
- The plan needs an unapproved architecture or product decision.
