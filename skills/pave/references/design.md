# Design

## Contents

- [Purpose](#purpose)
- [Steps](#steps)
- [Decision Triage](#decision-triage)
- [Evidence Gate](#evidence-gate)
- [Extensibility Gate](#extensibility-gate)
- [Decision Ledger](#decision-ledger)
- [Interview Progress Gate](#interview-progress-gate)
- [Design Quality Gate](#design-quality-gate)
- [Blocked Conditions](#blocked-conditions)

## Purpose

Turn a behavior-changing request into a small, explicit design before code or
test edits.

## Steps

1. Inspect the current project, relevant docs, recent changes, and established
   patterns before proposing a solution.
2. Confirm the request's purpose, constraints, and observable success criteria.
3. Split independent subsystems and classify each as `in-scope`,
   `preserve-current-behavior`, `extension-boundary`, `deferred`,
   `out-of-scope`, or `blocked`. Continue useful work on an independent
   in-scope subsystem when another subsystem is blocked.
4. Apply the Decision Triage, Evidence, Extensibility, Decision Ledger, and
   Interview Progress gates below before asking questions.
5. When materially different approaches exist, present the smallest viable
   options with trade-offs and a recommendation. Do not invent alternatives
   for a mechanical change with one obvious path.
6. For work that crosses a module or system boundary, name the entry point,
   existing shared owner of each rule, files and symbols, data or control flow,
   error location, and verification strategy. Keep this proportional; a
   mechanical local change does not need a program-design ceremony.
7. For a user-visible surface, resolve the project's design system from durable
   design policy, repo design artifacts, or the nearest canonical component.
   Name that source and design against its existing components, tokens,
   variants, and states instead of inventing a parallel pattern.
8. Remove speculative features and unrelated refactors.
9. Get approval for the behavior and implementation boundary before code or
   test edits. A short design is enough for a small change.

## Decision Triage

Ask the user only when all of these are true:

- the decision is inside the current product slice;
- it materially changes observable behavior, UX, security, privacy, data
  lifecycle, compatibility, rollout, cost, or acceptance;
- the answer is owned by the user rather than established by evidence; and
- preserving current behavior, an explicit requirement, or a reversible
  low-risk implementation choice cannot resolve it safely.

Do not ask the user to choose technical facts, restate an explicit requirement,
or approve routine implementation details. Exact copy, identifier formatting,
internal naming, and equivalent error representation are agent-owned unless
they affect a public contract, user experience, security, data, or an explicit
policy. Record consequential assumptions in the design and proceed.

A recommendation is a proposal, not a settled user decision. Do not call a
design confirmed while an in-scope, material `recommended-unconfirmed`
decision remains. Ask the user or explicitly defer the affected behavior.

## Evidence Gate

Label material facts and decisions by source:

- `user-confirmed`: the user owns and explicitly settled the policy or
  behavior;
- `repo-evidenced`: current code, tests, or durable repo policy establishes it;
- `externally-evidenced`: an authoritative external specification, provider
  capability, law, standard, or current platform contract establishes it;
- `agent-assumed`: a reversible, low-risk implementation choice made within
  the approved behavior;
- `recommended-unconfirmed`: a material user-owned choice still awaiting a
  decision.

Verify external integration capabilities from authoritative sources before
using them to shape the design. External facts are constraints, not user
preferences; do not ask the user to confirm whether a provider or platform
supports a capability.

## Extensibility Gate

Do not equate all forward-looking design with scope creep. Keep an
`extension-boundary` in the current design when at least one of these applies:

- the user explicitly requires multiple providers, variants, clients, or
  follow-on integrations;
- durable roadmap or repo evidence requires the extension;
- deferring the boundary would likely break a public API, persisted schema,
  identifier, or ownership model later; or
- the boundary is a small current cost that avoids material evidence-backed
  rework.

For each extension boundary, state the evidence, current cost, avoided rework,
and the behavior that remains deferred. Do not implement unused providers,
future workflows, speculative abstractions, or per-variant policies merely
because the boundary allows them later.

## Decision Ledger

Maintain one current ledger for material design decisions. Each entry records:

- stable ID and question;
- scope owner;
- source label;
- status: `active`, `superseded`, or `deferred`;
- selected behavior and evidence;
- replacement ID when superseded.

After any scope change, correction, or new external fact, reconcile the ledger
before asking another question. Never silently keep contradictory confirmed
decisions active.

## Interview Progress Gate

Before the first question, show the compact scope map and the complete known
list of blocking decisions. Ask only blocking decisions from that list. Follow
repo or user policy on one-at-a-time versus grouped questions; otherwise group
only tightly coupled decisions.

After each answer, update the ledger and state the remaining blocking decision
count. If new questions expand the initial list, explain the newly discovered
evidence and revisit scope instead of allowing an open-ended interview.

The interview is complete when every in-scope material user-owned decision is
`active` or explicitly `deferred`. Present the design and plan immediately;
do not continue asking about agent-owned details.

A response that selects an option or answers a design question settles that
decision only. Surface the resulting implementation boundary and plan, then
request implementation approval.

Read-only discovery does not require implementation approval. Treat the
workflow states separately:

1. scope intent authorizes investigation of the requested area;
2. read-only discovery gathers evidence;
3. design decisions settle behavior but do not authorize writes;
4. consolidated implementation approval authorizes code or test edits within
   the surfaced boundary.

Do not reinterpret a goal update as write approval, and do not stop safe
read-only discovery merely because write approval has not been granted.

When a read-only turn ends with a material user decision still pending, include
the exact `<!-- PAVE_AWAITING_DECISION -->` comment in the response. The
runtime guard retains the active workflow only when this marker, the approval
markers, or the blocked-report marker makes continuation explicit; an ordinary
read-only completion releases session state so it cannot constrain a later,
unrelated request.

## Design Quality Gate

- Each unit has one clear responsibility and boundary.
- Existing project conventions are followed unless the requested work requires
  a targeted change.
- User-visible surfaces reuse the project's resolved design system: existing
  components, tokens, variants, states, and accessibility baseline. Every
  deviation is a recorded material user-owned decision, not a silent choice.
- Dependencies and ownership are visible.
- Edge cases, failure behavior, and acceptance criteria are concrete.
- Required extension boundaries are justified without prebuilding deferred
  behavior.
- The ledger has no contradictory active decisions.

## Blocked Conditions

- Success criteria can be interpreted in materially different ways.
- A material user-owned product, security, data, compatibility, or rollout
  decision is missing.
- The request is too broad for one independently verifiable implementation.
