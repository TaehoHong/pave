# Small Change Fast Path

## Purpose

Finish obvious, low-risk edits without the ceremony required for feature or
policy work.

## Eligibility

Use this path only when all conditions hold:

- The requested outcome is concrete and has one obvious interpretation.
- The expected change is local: normally no more than two files and roughly
  twenty substantive lines, excluding generated output.
- No new abstraction, dependency, public API, schema, migration, auth,
  permission, security, data-lifecycle, concurrency, payment, deployment, or
  compatibility decision is involved.
- No destructive or external side effect is required.
- The target does not overlap unresolved user changes.
- A narrow, inexpensive verification command or direct check is known.

Line count is a heuristic, not permission to hide a risky change in a small
diff. A one-line security, schema, or API change uses the standard workflow.

## Flow

1. Read applicable repo instructions and inspect only the target plus the
   nearest context needed to edit safely.
2. State the fast-path classification, expected files, and verification in one
   concise update.
3. Treat the user's concrete edit request as implementation approval. Do not
   ask for a second approval or create a formal design, feature inventory,
   vertical-slice plan, plan file, or subagent task.
4. Make the smallest maintainable edit.
5. Apply `testing.md`; do not add a low-value test for a tiny change merely to
   satisfy process.
6. Run the narrow verification, inspect the diff, and report the outcome.

## Fallback

Switch to the standard PAVE workflow before expanding the change when:

- inspection reveals ambiguity, hidden coupling, or a policy decision;
- the edit grows beyond the expected local boundary;
- verification fails for a reason not directly explained by the edit;
- meaningful verification requires broader integration work; or
- any eligibility condition stops being true.

Explain the reason for leaving the fast path and request consolidated approval
only if the expanded scope is not already explicitly authorized.
