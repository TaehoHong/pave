# Planning

## Purpose

Produce a decision-complete checklist plan before implementation.

## Steps

1. Summarize current behavior and desired behavior.
2. Choose the smallest coherent implementation path.
3. Split work into checklist items small enough for one verified execution
   loop.
4. Assign tiers:
   - `T1 Scaffold`: structure, types, wiring.
   - `T2 Core Logic`: domain rules and algorithms.
   - `T3 Integration`: DB, API, filesystem, external systems.
   - `T4 Surface/E2E`: handlers, UI, CLI, user flows.
5. Apply `testing.md` and attach only tests with material regression value.
   Otherwise name the proportionate verification command and residual risk.
6. Resolve every product or policy ambiguity, including small details.
7. Apply the Feature Decision Gate.
8. List out-of-scope work.
9. Ask once for consolidated approval immediately before code or
   test edits.

Each checklist item must identify exact files, its observable outcome, the
narrow verification command, and the expected result. Fold scaffolding,
configuration, and documentation into the feature item that needs them rather
than creating placeholder-only tasks. Do not use `TBD`, `TODO`, or vague steps
such as "add error handling".

Do not create a test task merely to increase coverage or satisfy a test-first
ritual. The plan must state the behavior or risk each proposed test protects.

## Feature Decision Gate

Before implementation, list the feature inventory for the requested product
slice and record per-feature acceptance criteria and policy decisions: actor,
trigger, happy path, edge cases, permissions, data rules, error handling, and
verification. Do not start implementation while behavior-changing decisions are
unknown; ask or mark the item blocked.

## Outputs

- Keep the plan in conversation by default.
- For durable repo-local planning, write it under `.codex/pave/plans/` only when
  the optional repo runtime already exists or the user explicitly asks for it.
- Tiered checklist.
- Verification strategy.
- Approval gate.

## Blocked Conditions

- Success criteria are unclear.
- No meaningful verification strategy exists.
- The plan needs an unapproved architecture or product decision.
