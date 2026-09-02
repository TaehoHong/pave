# History and Troubleshooting Backfill

## Applies When

Read this reference only when the user explicitly asks to turn project history
or past troubleshooting into durable project knowledge.

## Steps

1. State and inspect a bounded Git range. Prefer the newest release tag through
   `HEAD`; when no useful tag exists, default to at most 50 first-parent
   commits. Do not scan an unbounded repository history by default.
2. Use commits only as navigation. Read relevant diffs, tests, existing docs,
   and linked issues or pull requests before asserting a durable fact. A commit
   message alone is not enough evidence for a root cause or user-owned
   decision.
3. Classify candidates with PAVE evidence labels. Do not promote
   `agent-assumed` or `recommended-unconfirmed` explanations.
4. Deduplicate against existing canonical docs and the troubleshooting index
   when present. Update or supersede matching knowledge instead of creating
   another account of the same event.
5. Route current rules to their owning project docs. Preserve a detailed
   troubleshooting record only for a non-obvious, recurring, cross-boundary,
   operational, security, data-integrity, compatibility, or reliability issue.
6. For ambiguous historical rationale, report the candidate and missing
   evidence rather than inventing why a change was made.
7. Keep raw transcripts, private logs, credentials, secrets, and unrelated
   internal payloads out of durable docs.

## Output

Report the inspected Git range in addition to the documentation-sync output.
