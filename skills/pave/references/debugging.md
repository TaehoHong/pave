# Root-Cause Debugging

## Purpose

Find and prove the cause of unexpected behavior before changing production
code.

## Investigation

1. Read the complete error, stack trace, logs, and relevant command output.
2. Reproduce the problem with exact steps. If it is intermittent, gather more
   evidence instead of guessing.
3. Inspect recent diffs, dependency or configuration changes, and environment
   differences.
4. Trace the bad value or state backward across component boundaries. Record
   what enters and leaves each relevant boundary when the failure location is
   unclear.
5. Find the nearest working example in the same codebase and list meaningful
   differences.
6. State one falsifiable root-cause hypothesis and the evidence supporting it.
7. Test that hypothesis with the smallest diagnostic action or change. Change
   one variable at a time.

## Fix

1. Apply the Test Value Gate. Add the smallest regression test only when it
   protects the proven failure mode; otherwise preserve a reliable reproduction
   and explain why an automated test would add little value.
2. Fix the proven cause at its source without unrelated cleanup.
3. Run the narrow reproduction, affected tests, and declared broader
   verification.
4. If the hypothesis fails, remove or revert the diagnostic change and return
   to investigation with the new evidence.
5. After three failed fix hypotheses, stop and reassess the architecture or
   assumptions with the user before another implementation attempt.

## Blocked Conditions

- The issue cannot be reproduced and there is insufficient diagnostic evidence.
- Required logs, environment access, credentials, or external state are absent.
- Evidence points to a product or architecture decision rather than an
  implementation defect.
