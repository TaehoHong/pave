# Planning

## Purpose

Produce an implementation-ready checklist plan before implementation.

## Steps

1. Summarize current behavior and desired behavior.
2. Run the Existing Owner Check for each rule, validation, transformation, or
   shared behavior the work introduces. Search for a current owner with at
   least two targeted signals and record `owner-found`, `owner-absent`, or
   `owner-rejected` per behavior. Plan to extend a found owner rather than add
   a parallel implementation, and treat every `owner-rejected` outcome as a
   material decision with a stated reason.
3. Choose the smallest coherent implementation path.
4. Split work into vertical behavior slices small enough for one verified
   execution loop. Each slice should deliver one observable actor outcome
   through every layer it needs.
5. Order slices by dependency and smallest useful behavior. Fold required
   scaffolding, core logic, integration, and surface work into the slice that
   uses them. Risk or review-depth labels are metadata, not execution order.
6. Apply the Test Value Gate and attach only tests with material regression
   value. Otherwise name the proportionate verification command and residual
   risk.
7. For a behavior-changing outcome without implementation-ready requirements,
   or when a material user-owned decision remains unresolved, apply the
   Decision Triage, Evidence, Extensibility, Decision Ledger, and Interview
   Progress gates. For a mechanical plan with one repo-evidenced path, record
   zero blocking decisions without loading the full design workflow.
8. Apply the Feature Readiness Gate.
9. List out-of-scope work.
10. For plan-only work, output the approval gate and stop. In the standard
    workflow, request consolidated approval only after the Feature Readiness
    Gate has passed and immediately before code or test edits.

Each checklist item must identify exact files, its observable outcome, the
narrow verification command, and the expected result. Fold scaffolding,
configuration, and documentation into the feature item that needs them rather
than creating placeholder-only tasks. Do not use `TBD`, `TODO`, or vague steps
such as "add error handling".

Do not create a test task merely to increase coverage or satisfy a test-first
ritual. The plan must state the behavior or risk each proposed test protects.

## Feature Readiness Gate

Before implementation, list the feature inventory for the requested product
slice and record its actor, trigger, happy path, material edge cases,
permissions, data rules, public error behavior, acceptance criteria, and
verification. Also list `preserve-current-behavior`, justified
`extension-boundary`, `deferred`, and `out-of-scope` items.

Use the PAVE source labels and ledger statuses. Do not present the plan as final
while an in-scope material user-owned decision is unknown or
`recommended-unconfirmed`; ask or explicitly defer the affected behavior.
Agent-owned implementation details do not block readiness.

## Outputs

- Keep the plan in conversation by default.
- For durable repo-local planning, write it under `.codex/pave/plans/` only when
  the optional repo runtime already exists or the user explicitly asks for it.
- Vertically sliced checklist.
- Scope map and current decision ledger.
- Verification strategy.
- Approval gate.

## Blocked Conditions

- Success criteria are unclear.
- No meaningful verification strategy exists.
- The plan needs an unapproved architecture or product decision.
