# Testing

## Purpose

Create tests only when they provide meaningful regression protection relative
to their maintenance cost, and write them so they catch wrong behavior without
breaking on behavior-preserving refactors.

Start from one question: what could this change break, and which of those
risks must a test confirm?

## Test Value Gate

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

## Choosing What to Test

- Do not enumerate every input or combination. Pick high-risk areas and
  representative cases, and be able to state why each was chosen.
- Concentrate on complex or frequently changed code, code with past incidents,
  and authorization, payment, messaging, or deletion paths.
- When a requirement is ambiguous (for example, whether a threshold is
  inclusive, or what must happen on failure), do not guess the expected value.
  Ask, or mark it as needing confirmation.
- When behavior changes, passing existing tests is not enough. Add cases for
  the new conditions and boundaries.
- Verify what the requirement intends, not what the implementation happens to
  do.
- Read the repository's existing test structure, naming, helpers, and fixtures
  first and follow them.

## Test Design

**Verify the contract.** Assert on results a caller can observe: return
values, errors, persisted state, responses. Do not assert private method calls,
internal call order, or internal fields. Assert call counts or order only when
they are the requirement itself, such as duplicate-send prevention or no store
access on a cache hit.

**Derive expected values from the specification.** Use literal values taken
from the requirement. Do not call the unit under test again or copy its formula
to compute the expectation. Do not adopt the current output as the answer. A
test that pins existing behavior must say so and report that the behavior's
correctness is unconfirmed.

```ts
// 3,000 off for orders of 30,000 or more
expect(discountFor(29_999)).toBe(0);
expect(discountFor(30_000)).toBe(3_000);
```

**Choose cases where behavior changes.** From boundaries (just below, equal,
just above), condition combinations (owner x role x state), state transitions
(disallowed or repeated transitions), side effects on failure (partial writes),
and duplicate or concurrent requests, pick only the ones meaningful for the
feature.

**Make test data discriminate.** When testing a filter, include data that must
be excluded and assert on IDs. An implementation that drops the filter or
returns an empty result must fail.

**Use the smallest scope where the defect is visible.**

- Calculation or state rules: unit test.
- SQL, database constraints, transactions: integration test against a real
  database.
- Request binding, authentication, authorization, response mapping: a test
  that includes the HTTP boundary.
- Core user flows: component test or end-to-end test.

Do not repeat the same condition and outcome across layers.

**Use test doubles only to reproduce conditions that are hard to control.**

- Valid uses: external API timeouts or errors, blocking network, billing, or
  message sending, fixing time or randomness.
- Preference order: real implementation, fake, stub, mock.
- Do not mock the logic under test. For example, do not mock SQL execution
  while verifying SQL.
- Do not mock types you do not own, such as external SDKs. Wrap them in an
  adapter and replace the adapter boundary.
- Report integrations confirmed only through mocks as unverified.

**Confirm the test can detect the defect.**

- For bug fixes, write the reproduction test first. Confirm it fails before
  the fix and passes after. The pre-fix failure must come from the behavioral
  assertion, not from an import, compile, or environment error.
- Use coverage only to find untested areas. Do not add tests to raise
  coverage.
- For critical logic, you may deliberately alter a condition or operator to
  confirm a test fails. Always revert the alteration afterward.

## Test Code

- One test verifies one behavior. Use as many assertions as that behavior
  needs. Do not bundle unrelated goals into one test.
- Keep arrange, act, and assert readable in the code.
- Keep the test's key conditions and expected result in the test body. Data
  setup and environment wiring may move into helpers. Avoid opaque arguments
  such as `createScenario(3, true, false)`.
- Do not put loops, conditionals, or expected-value computation in tests. List
  multiple inputs as a parameterized test.
- Name tests by condition and expected result, for example "deleting another
  user's post is rejected and the post remains".
- Assert concrete values. Unless existence is the contract, do not stop at a
  truthy or not-null check or `status == 200`.
- Control anything that can change the result: time, time zone, randomness,
  shared state, execution order. Set up and clean up data per test.
- Wait for asynchronous work with condition-based assertions instead of fixed
  sleeps, and check for missing `await`.
- Review snapshot diffs before updating snapshots.
- Never use real personal data or credentials in test data. Use fictitious
  values or environment variables.

## When a Test Fails

Do not make a failure disappear without finding the cause. In particular, do
not:

- loosen assertions;
- change expected values without evidence;
- exclude tests with `skip`, `only`, or `xfail`;
- add retries; or
- replace the unit under test with a mock.

When an expected value must change, state whether the requirement changed or
the existing test was wrong, with evidence.

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

Judge a test by what it catches, not by its form:

- What realistic wrong implementation makes it fail? If there is none, remove
  it.
- Does it break when only the implementation changes and behavior stays the
  same? If so, rewrite it against the contract.

## Reporting Test Work

In addition to the verification evidence, state for each new or changed test:
the contract it protects, the source of its expected values (mark guesses as
needing confirmation), what was run for real versus replaced by doubles, and
residual risk such as mock-only integrations or tests that could not run.
