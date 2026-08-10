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

## Investigation Ledger

Keep a compact ledger in the conversation, active plan, or an already-approved
local task artifact while investigating. For each meaningful attempt record:

- the symptom or boundary being explained;
- the falsifiable hypothesis;
- the evidence that motivated it;
- the diagnostic action that would disprove it;
- the observed result; and
- the current confidence: `unknown`, `probable`, or `proven`.

Do not turn the ledger into a command transcript. Omit routine reads and failed
attempts that taught nothing. Never record a hypothesis as the root cause until
the diagnostic evidence distinguishes it from plausible alternatives.

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

## Troubleshooting Completion

After the fix is verified, decide whether the result carries reusable project
knowledge. A durable troubleshooting record is warranted when the cause was
non-obvious, crossed a component or environment boundary, is likely to recur,
changed an operational or verification rule, or affected security, privacy,
data integrity, compatibility, or reliability.

For a resolved record, require all of the following:

- exact symptom and material impact;
- reproducible conditions or equivalent diagnostic evidence;
- root cause with `proven` confidence;
- the fix at the owning source;
- regression guard or the strongest proportionate verification;
- verification commands and results; and
- affected files plus commit, issue, or pull-request references when available.

An unresolved investigation may be preserved only when it will materially help
the next investigation. Mark it `unresolved`, keep root-cause confidence
`unknown` or `probable`, list eliminated hypotheses and the next diagnostic
step, and never present a mitigation as a proven solution.

Keep detailed incident evidence separate from current project rules. The
incident record explains what happened and why; canonical project docs retain
only the current architecture, operational, quality, or ownership rule that
future work must follow.

## Blocked Conditions

- The issue cannot be reproduced and there is insufficient diagnostic evidence.
- Required logs, environment access, credentials, or external state are absent.
- Evidence points to a product or architecture decision rather than an
  implementation defect.
