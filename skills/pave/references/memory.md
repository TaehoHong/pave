# Durable Project Knowledge

## Purpose

Turn verified task outcomes into reusable project knowledge without treating
task history, chat transcripts, or diagnostic noise as canonical truth.

Git remains the detailed change history. Durable project documentation explains
the current rule, why it exists, and the evidence that supports it.

## Evaluation Timing

Evaluate knowledge promotion after implementation and fresh verification, but
before the final report. During planning, include predictable documentation
targets in the surfaced implementation boundary. Do not surprise the user with
additional durable files after approval.

If promotion would exceed the Small Change Fast Path file or line limits, leave
the fast path and surface the expanded standard-work boundary before writing.

## Promotion Gate

Promote a result only when it is useful beyond the current task and is backed
by at least one accepted PAVE evidence source:

- `user-confirmed`: an explicit product, architecture, design, deployment, or
  quality decision;
- `repo-evidenced`: current code, tests, configuration, or verified runtime
  behavior establishes the fact; or
- `externally-evidenced`: an authoritative external contract establishes a
  constraint that the project must follow.

Never promote `agent-assumed` or `recommended-unconfirmed` claims. Do not
promote a single observed implementation pattern into a project rule unless
repo policy, repeated evidence, or the user establishes it as canonical.

Good candidates include:

- durable product, architecture, design, deployment, or compatibility
  decisions;
- verified module boundaries, shared owners, and canonical examples;
- non-obvious bug root causes and recurring failure modes;
- operational recovery, monitoring, setup, or verification rules; and
- migration or deprecation reasons that future work must preserve.

Skip mechanical edits, self-explanatory one-off bugs, temporary task state,
raw logs, transcripts, payload dumps, credentials, secrets, and facts already
captured accurately by the canonical owner.

## Canonical Routing

Use existing project documentation as the owner. Existing linked sources,
ADRs, runbooks, postmortems, or project wikis remain canonical; do not create a
parallel memory tree.

When PAVE project docs own the subject, route knowledge as follows:

| Knowledge | Canonical target |
| --- | --- |
| Product direction, scope, priority | `docs/00-overview.md`, `docs/01-roadmap.md` |
| Development and verification rules | `docs/02-development-rules.md`, `docs/05-quality-rules.md` |
| Deployment, operations, recovery | `docs/03-deployment-rules.md` |
| Product design rules | `docs/04-design-rules.md` |
| Architecture decisions and invariants | `docs/06-architecture.md` |
| Module ownership, canonical code, narrow commands | `docs/07-codebase-guide.md` |

In plugin-only mode, do not create `docs/`, `.wiki/`, or another durable tree.
Report the candidate and skip reason unless the user explicitly approves
project runtime or another existing canonical document owns the knowledge.

## Durable Troubleshooting Records

Use detailed troubleshooting records only for high-signal incidents that pass
the Promotion Gate. Prefer an existing incident, postmortem, or runbook root.
Otherwise, when durable project docs already exist and the approved scope
includes the write, lazily create:

```text
docs/troubleshooting/
├── _index.md
└── YYYY-MM-DD-descriptive-slug.md
```

Initialize these files from `assets/troubleshooting/index.md` and
`assets/troubleshooting/record.md`. Do not create the directory during project
initialization or for a project that has no qualifying record.

Before creating a record:

1. Read `_index.md` and search existing records by affected area, symptom,
   paths, and root cause.
2. Update or supersede an existing record when it describes the same failure;
   do not duplicate it under a new title.
3. Require `root-cause-confidence: proven` for a resolved root cause. Preserve
   uncertain investigations only as `unresolved` or `mitigated` with explicit
   uncertainty.
4. Add the record to `_index.md`, then distill any current rule into the
   canonical project doc that owns it.

Allowed lifecycle states are `resolved`, `mitigated`, `unresolved`, and
`superseded`. A superseded record links to its replacement. Keep concise,
redacted evidence rather than raw logs or private conversation.

## Knowledge Delta

Every mutating final report includes one of:

- promoted knowledge with its target path and evidence source;
- superseded knowledge with its replacement;
- an unresolved troubleshooting record with explicit next evidence; or
- a concise reason no durable promotion was warranted.

Knowledge capture is not complete merely because a report says it happened.
The target document must exist in the diff, or the report must say that the
candidate was intentionally left unpersisted.
