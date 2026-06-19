# Execution Loop

## Purpose

Execute approved plan items in small verified increments.

## Steps

1. Identify the next unchecked item in the active approved scope.
2. Announce item, tier, expected files, and expected test.
3. Red: add or adjust the smallest meaningful failing test.
4. Run the narrow command and confirm expected failure.
5. Green: implement the minimum code needed.
6. Run the narrow command and confirm success.
7. Review according to tier.
8. Fix critical and major review issues.
9. Mark the item complete in the plan.
10. Summarize changed files, commands, result, and next item.

## Blocked Conditions

- A meaningful failing test cannot be written.
- The failure does not prove intended behavior.
- The item requires broad changes outside the approved plan.
- A new product or policy ambiguity appears.
- Destructive action, credential, or new permission is required.
- Verification repeats without new evidence or a plausible fix.
