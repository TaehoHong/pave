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
7. Apply the Decision Triage, Evidence, Extensibility, Decision Ledger, and
   Interview Progress gates. Resolve only material, user-owned decisions that
   block the current slice.
8. Apply the Feature Readiness Gate.
9. List out-of-scope work.
10. Ask once for consolidated approval immediately before code or
    test edits.

Approval must be an explicit implementation instruction for the surfaced
Implementation Contract and checklist. The contract contains the goal and
acceptance criteria, expected changed files and external operations,
out-of-scope behavior, material capabilities and risks, fresh verification,
remaining blocking decisions, and approval method. Selecting a design option,
answering a clarification, or adding requirements settles scope or behavior
only. An earlier request to implement records implementation intent but does
not authorize a materially changed contract. Read-only discovery never
requires this approval.

Immediately before asking for standard-work implementation approval, confirm
that the Feature Readiness Gate has passed, the surfaced boundary is complete,
and no material in-scope decision remains unknown or
`recommended-unconfirmed`. Then use the host's normal approval UX instead of
requiring another PAVE command:

- Codex: move `[PAVE:approval]` to `in_progress`, then use
  `request_user_input` when available with question ID
  `pave_implementation_approval` and `Implement (Recommended)` / `Revise plan`
  choices.
  When a structured choice is unavailable, a direct response must clearly
  authorize the currently surfaced contract.
- Claude Code: when already in plan mode, use `ExitPlanMode` for ordinary plan
  approval. Otherwise use `AskUserQuestion` with the `PAVE approve` header and
  `Implement` / `Revise plan` choices.

The user approves the surfaced contract, not a route, tool name, plan marker,
or hidden runtime state. Changing expected files, external operations, material
capabilities or risks, verification strategy, or observable behavior
materially requires renewed approval before acting. Host permissions and
sandboxing govern tool execution; repository and operational policy govern CI,
credentials, migrations, and deployment. Do not place machine-readable
approval markers in assistant response text.

When the implementation boundary includes writing, modifying, or executing DDL
or a database schema migration, also show the exact target files, statements or
migration operations, data and compatibility effects, and rollback approach.
Then use a distinct structured choice: Codex question ID
`pave_ddl_approval`, or Claude Code `PAVE DDL`, with `Implement with DDL` and
`Revise plan` options (`Implement with DDL (Recommended)` on Codex). If a
structured choice is unavailable, require a direct
response that explicitly names DDL. General approval does not authorize DDL.
Newly discovered or changed DDL requires a newly surfaced approval request and
another DDL-specific choice.

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
