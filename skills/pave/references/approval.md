# Standard Implementation Approval

## Purpose

Bind standard implementation work to one surfaced contract and explicit user
approval without loading approval mechanics during unrelated read-only work.

Read this file only after the Feature Readiness Gate has passed and immediately
before requesting approval for code or test edits. Also read it when a fast-path
change expands into standard work. Plan-only and read-only requests stop without
loading this file unless the user asks to proceed to implementation.

## Implementation Contract

Present one current contract containing:

- the goal and observable acceptance criteria;
- expected changed files and external operations;
- out-of-scope behavior;
- material capabilities such as DDL, destructive actions, external writes,
  security boundaries, or user-visible changes;
- fresh verification commands or checks and their expected results;
- the remaining material blocking-decision count; and
- the approval method and the contract the user approved.

Before requesting approval, confirm that the surfaced boundary is complete and
no material in-scope decision remains unknown or `recommended-unconfirmed`.
Selecting a design option, answering a clarification, or adding requirements
settles scope or behavior only. Scope intent authorizes read-only discovery but
not writes.

## Approval Method

Ask once for consolidated approval immediately before implementation:

- Codex: use `request_user_input` when available with question ID
  `pave_implementation_approval` and `Implement (Recommended)` / `Revise plan`
  choices. When a structured choice is unavailable, require a direct response
  that clearly authorizes the surfaced contract.
- Claude Code: when already in plan mode, use `ExitPlanMode` for ordinary plan
  approval. Otherwise use `AskUserQuestion` with the `PAVE approve` header and
  `Implement` / `Revise plan` choices.

Do not require another PAVE command or place machine-readable approval markers
in assistant text. Host UI state, plan telemetry, assistant text, and reference
reads are not technical proof of execution authority. Host permissions and
sandboxing govern tool execution; repository and operational policy govern CI,
credentials, migrations, and deployment.

## DDL Approval

Writing, modifying, or executing DDL or a database schema migration always
requires distinct approval. Surface the exact target files, statements or
migration operations, data and compatibility effects, and rollback approach.
Use Codex question ID `pave_ddl_approval`, or Claude Code header `PAVE DDL`,
with `Implement with DDL` and `Revise plan` choices (`Implement with DDL
(Recommended)` on Codex).

If a structured choice is unavailable, require a direct response that
explicitly names DDL. General implementation approval and the fast path do not
authorize DDL. Newly discovered or changed DDL requires a newly surfaced
contract and another DDL-specific approval.

## Contract Boundary

The user approves the surfaced contract, not a route, tool name, or hidden
runtime state. Obtain renewed approval before acting when expected files,
external operations, material capabilities or risks, verification strategy, or
observable behavior changes materially.
