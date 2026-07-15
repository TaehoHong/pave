# Test Value Gate

## Purpose

Create tests only when they provide meaningful regression protection relative
to their maintenance cost.

## Gate

Before writing or expanding a test, answer all of the following:

1. What observable behavior, external contract, proven regression, or
   high-risk boundary does this test protect?
2. What realistic defect would make this test fail?
3. Would the test still be useful after internal refactoring?
4. Does it add protection not already provided by a narrower existing test,
   type check, parser, build, lint rule, or verification command?
5. Is its setup and maintenance cost proportionate to the risk it covers?

Create the test only when the answers show material regression value. A test
that cannot distinguish a broken implementation from a correct one must not be
added.

## Low-Value Tests to Reject

- Assertions that only confirm a file, symbol, or static string exists when a
  parser, build, type check, or manifest validation already proves it.
- Tests of private implementation details, mock call counts, or internal
  ordering that are not part of an external contract.
- Tests that duplicate an existing scenario without covering a different risk,
  boundary, or failure mode.
- Snapshot or coverage-only tests with no reviewed behavioral assertion.
- Tautological tests that reproduce the production algorithm in the assertion.
- Tests of framework behavior, trivial accessors, constants, or generated code.
- Exact documentation wording or formatting checks unless that text is a
  machine-consumed or explicitly supported public interface.
- Happy-path tests whose assertions would also pass for the known broken or
  empty implementation.

## When a New Test Is Not Worthwhile

Do not create a ceremonial test. Record why a new automated test would add
little value, then use the strongest proportionate alternative: an existing
test, type check, lint, build, schema validation, focused command, or manual
scenario. Report the residual risk instead of implying equivalent coverage.

## Review Rule

Review new or modified tests as production code. Remove or simplify tests that
do not pass this gate, even when they increase coverage or test count.
