# Review

## Purpose

Check requirement compliance and code quality with evidence before completion.

## Self-Review

1. Re-read the approved scope and inspect the actual diff.
2. Check for missing requirements and unrequested behavior first.
3. Check correctness, security, data integrity, compatibility, error handling,
   maintainability, and test quality.
4. Apply `testing.md` to every new or modified test. Flag tests that duplicate
   existing coverage, assert implementation details, or cannot catch a
   realistic defect.
5. Cite file and line evidence for actionable findings and rank them by impact.
6. Fix critical and major issues, rerun the covering tests, and review the
   resulting diff again.

## Receiving Feedback

1. Read all feedback before editing so related items stay coherent.
2. Verify each suggestion against the current code, tests, project constraints,
   and prior user decisions.
3. Clarify feedback that can be interpreted in materially different ways.
4. Push back with technical evidence when a suggestion is incorrect, breaks
   compatibility, conflicts with an approved decision, or adds unused scope.
5. Apply accepted items one at a time and run the narrow covering test after
   each coherent change.

## Delegated Review

- Give a reviewer the approved scope, exact diff boundary, relevant constraints,
  and verification evidence.
- Treat a reviewer report as input, not proof. The main agent inspects the diff
  and reruns verification before making a completion claim.
