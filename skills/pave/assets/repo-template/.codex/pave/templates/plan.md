# Plan: <task name>

## Goal

<User-visible outcome.>

## Success Criteria

- <Observable outcome>
- <Declared verification command that must pass>

## Constraints

- Product/policy ambiguity: <questions asked and resolved>
- Out of scope: <explicit non-goals>

## Current Context

- <Repo facts discovered during scan>

## Execution Mode

- Approval: one consolidated approval required immediately before code/test edits
- Re-approval required only for scope change, destructive action, new ambiguity, credentials, permissions, or invalidated verification strategy
- Default: `go`

## Checklist

### [ ] 1. <item title> <!-- T1 Scaffold -->

- Behavior: <expected behavior>
- Test: <test file or command>
- Review: light

### [ ] 2. <item title> <!-- T2 Core Logic -->

- Behavior: <expected behavior>
- Test: <test file or command>
- Review: deep

### [ ] 3. <item title> <!-- T3 Integration -->

- Behavior: <expected behavior>
- Test: <test file or command>
- Review: medium plus specialist checks when relevant

### [ ] 4. <item title> <!-- T4 Surface/E2E -->

- Behavior: <expected behavior>
- Test: <test file or command>
- Review: light to medium

## Final Verification

- Format: `<command or not declared>`
- Lint: `<command or not declared>`
- Unit tests: `<command or not declared>`
- Integration or E2E tests: `<command or not declared>`
- Build or typecheck: `<command or not declared>`
