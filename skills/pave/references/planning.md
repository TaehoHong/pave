# Planning

## Purpose

Produce a decision-complete checklist plan before implementation.

## Steps

1. Summarize current behavior and desired behavior.
2. Choose the smallest coherent implementation path.
3. Split work into vertical behavior slices small enough for one verified
   execution loop. Each slice should deliver one observable actor outcome
   through every layer it needs.
4. Order slices by dependency and smallest useful behavior. Fold required
   scaffolding, core logic, integration, and surface work into the slice that
   uses them. Risk or review-depth labels are metadata, not execution order.
5. Apply `testing.md` and attach only tests with material regression value.
   Otherwise name the proportionate verification command and residual risk.
6. Resolve every product or policy ambiguity, including small details.
7. Apply the Feature Decision Gate.
8. List out-of-scope work.
9. Ask once for consolidated approval immediately before code or
   test edits.

Approval must be an explicit implementation instruction given after the
design, implementation boundary, and checklist have been surfaced. Selecting a
design option, answering a clarification, or adding requirements is not
implementation approval.

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
verification. Label each decision `user-confirmed`, `repo-evidenced`, or
`recommended-unconfirmed`. A recommendation is never settled by the agent:
ask the user and change its source to `user-confirmed`. Do not present the plan
as final or ask for implementation approval while a behavior-changing decision
is unknown or `recommended-unconfirmed`; ask or mark the item blocked.

## Outputs

- Keep the plan in conversation by default.
- For durable repo-local planning, write it under `.codex/pave/plans/` only when
  the optional repo runtime already exists or the user explicitly asks for it.
- Vertically sliced checklist.
- Verification strategy.
- Approval gate.

## Blocked Conditions

- Success criteria are unclear.
- No meaningful verification strategy exists.
- The plan needs an unapproved architecture or product decision.
