# Small Change Fast Path

## Purpose

Finish obvious, low-risk edits without the ceremony required for feature or
policy work.

## Eligibility

Use this path only when all conditions hold:

- The user's request directly instructs implementation and has one obvious
  interpretation.
- The expected hand-edited change touches no more than two files and no more
  than twenty substantive lines. Both limits are hard eligibility conditions.
  Generated output is excluded from the counts but must still be verified.
- No new abstraction, dependency, public API, schema, migration, auth,
  permission, security, data-lifecycle, concurrency, payment, deployment, or
  compatibility decision is involved.
- A user-visible edit reuses the project's existing design-system components,
  tokens, and variants. Needing a new component, token, or variant, or any
  design-system deviation, ends eligibility.
- No destructive or external side effect is required.
- The target does not overlap unresolved user changes.
- A narrow, inexpensive verification command or direct check is known.

Size alone never makes a risky change eligible. A one-line security, schema,
or API change uses the standard workflow.

A reply that only selects a design option, answers a clarification, or adds
requirements is not implementation approval, even if the agent previously
said it would implement after the reply.

## Flow

1. Read applicable repo instructions and inspect only the target plus the
   nearest context needed to edit safely.
2. Run the Existing Owner Check when the edit adds logic rather than adjusting
   a value, string, or existing call. Search for a current owner of that
   behavior with at least two targeted signals and record `owner-found`,
   `owner-absent`, or `owner-rejected`. Extend a found owner instead of adding
   a parallel implementation. An `owner-rejected` outcome ends fast-path
   eligibility because a second implementation of one rule is a design change.
3. Before any write, state the fast-path classification, expected files,
   expected substantive line count, and verification in one concise update.
4. Treat the user's concrete edit request as implementation approval. Do not
   ask for a second approval or create a formal design, feature inventory,
   vertical-slice plan, plan file, or subagent task.
   On Codex, a compact `update_plan` containing only `[PAVE:inspect]`,
   `[PAVE:execute]`, `[PAVE:verify]`, and `[PAVE:report]` telemetry steps is
   allowed and does not turn the request into the standard planning workflow.
5. Make the smallest maintainable edit.
6. Apply the Test Value Gate; do not add a low-value test for a tiny change
   merely to satisfy process.
7. Run the narrow verification, inspect the diff, and report the outcome.

## Fallback

Switch to the standard PAVE workflow before expanding the change when:

- inspection reveals ambiguity, hidden coupling, or a policy decision;
- the Existing Owner Check returns `owner-rejected`, or extending a found owner
  would exceed the local boundary;
- a user-visible edit needs a new component, token, or variant, or a
  design-system deviation;
- the edit grows beyond the expected local boundary;
- verification fails for a reason not directly explained by the edit;
- meaningful verification requires broader integration work; or
- any eligibility condition stops being true.

Before touching a third hand-edited file or exceeding twenty substantive
hand-edited lines, stop, explain why the fast path no longer applies, surface
the standard Implementation Contract, and request consolidated approval. Keep
the investigation evidence, but do not treat the original fast-path request as
approval for expanded scope. Only an explicit implementation instruction given
in response to the surfaced contract counts as approval.
