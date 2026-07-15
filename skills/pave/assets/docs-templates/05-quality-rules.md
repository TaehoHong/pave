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
