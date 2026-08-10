# 05. Quality Rules

## Completion Bar

Work is complete only when declared verification passes or a blocked
report explains why it cannot pass.

## Test Strategy

- Add a test only when it protects observable behavior, an external contract,
  a proven regression, or a high-risk boundary and can catch a realistic
  defect.
- Reject duplicate, implementation-detail, coverage-only, ceremonial, and
  tautological tests.
- When a new automated test adds little regression value, use the strongest
  proportionate verification and record residual risk.
- Unit:
- Integration:
- E2E:
- Manual QA:

## Regression Risk

Record risky areas, known gaps, and checks that catch regressions.

## Troubleshooting Knowledge

Link only high-signal incident records whose root cause, mitigation, or next
diagnostic step remains useful. Reverify historical conclusions against current
code before relying on them.

| Area | Failure mode | Current guard | Troubleshooting records | Evidence paths | Status |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

## Linked Sources

Existing project documentation that owns part of this subject. Keep the linked
source canonical; record only what it owns and what it leaves open.

| Source | Owns | Not covered | Evidence paths |
| --- | --- | --- | --- |
|  |  |  |  |
