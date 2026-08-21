# Execution Loop

## Purpose

Execute approved plan items in small verified increments.

## Steps

1. Identify the next unchecked item in the active approved scope. If it writes,
   modifies, or executes DDL that was not explicitly surfaced for DDL approval,
   stop and return to design and planning before making the change.
2. Announce item, tier, expected files, and expected verification.
3. Apply the Test Value Gate. State the concrete behavior or risk a proposed
   test protects and the realistic defect that would make it fail.
4. If the test passes the gate, Red: add or adjust the smallest test for that
   behavior. Run it and confirm it fails for the expected missing
   behavior, not a syntax, fixture, or environment error.
5. Green: implement only the code needed for that test.
6. Run the narrow command and confirm success, then refactor only while tests
   remain green.
7. If a new test fails the value gate, do not create it. Record why, define the
   strongest proportionate verification check, and state residual risk before
   editing.
8. Review the diff against the approved scope for missing requirements,
   correctness, safety, compatibility, maintainability, and test value.
9. Fix critical and major review issues and rerun their covering tests.
10. Mark the item complete in the plan only after fresh evidence.
11. Summarize changed files, commands, result, and next item.

## Blocked Conditions

- No test or proportionate verification can prove the intended behavior.
- A proposed test cannot distinguish the intended behavior from a broken
  implementation.
- The item requires broad changes outside the approved plan.
- A new product or policy ambiguity appears.
- DDL or a database schema migration is outside the explicitly approved DDL scope.
- Destructive action, credential, or new permission is required.
- Verification repeats without new evidence or a plausible fix.
