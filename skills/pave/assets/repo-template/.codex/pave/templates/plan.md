# Plan: <task name>

## Goal

<User-visible outcome.>

## Success Criteria

- <Observable outcome>
- <Declared verification command that must pass>

## Constraints

- Scope map:
  - In scope: <current product slice>
  - Preserve current behavior: <untouched contracts>
  - Extension boundaries: <evidence, current cost, avoided rework>
  - Deferred: <future behavior and owning workflow>
  - Out of scope: <explicit non-goals>
- Remaining blocking decisions: <count>
- Test Value Gate: each proposed test names the behavior or risk it protects
  and the realistic defect that would make it fail; otherwise use
  proportionate verification and record residual risk

## Decision Ledger

| ID | Scope owner | Source | Status | Decision / evidence | Replaced by |
| --- | --- | --- | --- | --- | --- |
| D-1 | <feature> | <user-confirmed, repo-evidenced, externally-evidenced, agent-assumed, or recommended-unconfirmed> | <active, superseded, or deferred> | <current decision> | <ID or n/a> |

## Current Context

- <Repo facts discovered during scan>

## Execution Mode

- Approval: one consolidated approval required immediately before code/test edits
- Read-only discovery: authorized by scope intent; no implementation approval required
- Re-approval required only for scope change, destructive action, new ambiguity, credentials, permissions, or invalidated verification strategy
- Default: `go`

## Checklist

### [ ] 1. <Vertical Slice: actor outcome>

- Flow: <entry point -> shared rule owner -> observable result>
- Files and symbols: <exact implementation boundary>
- Verification: <valuable test and protected risk, or non-test command and residual risk>
- Human review focus: <key file, decision, or residual risk>

### [ ] 2. <Vertical Slice: next actor outcome>

- Flow: <entry point -> shared rule owner -> observable result>
- Files and symbols: <exact implementation boundary>
- Verification: <valuable test and protected risk, or non-test command and residual risk>
- Human review focus: <key file, decision, or residual risk>

## Final Verification

- Format: `<command or not declared>`
- Lint: `<command or not declared>`
- Unit tests: `<command or not declared>`
- Integration or E2E tests: `<command or not declared>`
- Build or typecheck: `<command or not declared>`
