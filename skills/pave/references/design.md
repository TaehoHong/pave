# Design

## Purpose

Turn a behavior-changing request into a small, explicit design before code or
test edits.

## Steps

1. Inspect the current project, relevant docs, recent changes, and established
   patterns before proposing a solution.
2. Confirm the request's purpose, constraints, and observable success criteria.
   When the request gives only an outcome, ask focused, grouped questions and
   follow up until the answers are decision-complete before presenting a final
   design.
3. Split requests that contain independent subsystems before designing them.
4. Identify every product or policy decision and label its source:
   `user-confirmed`, `repo-evidenced`, or `recommended-unconfirmed`. Repository
   evidence must directly establish the applicable behavior or policy.
5. When materially different approaches exist, present the smallest viable
   options with trade-offs and a recommendation. Do not invent alternatives
   for a mechanical change with one obvious path.
6. For work that crosses a module or system boundary, name the entry point,
   existing shared owner of each rule, files and symbols, data or control flow,
   error location, and verification strategy. Keep this proportional; a
   mechanical local change does not need a program-design ceremony.
7. Remove speculative features and unrelated refactors.
8. Get approval for the behavior and implementation boundary before code or
   test edits. A short design is enough for a small change.

A recommendation is a proposal, not a settled decision. Do not call a design
confirmed or ask for implementation approval while a behavior-changing
`recommended-unconfirmed` decision remains. Ask the user and update its source
to `user-confirmed` first.

A response that selects an option or answers a design question settles that
decision only. Surface the resulting implementation boundary and plan, then
request implementation approval.

## Design Quality Gate

- Each unit has one clear responsibility and boundary.
- Existing project conventions are followed unless the requested work requires
  a targeted change.
- Dependencies and ownership are visible.
- Edge cases, failure behavior, and acceptance criteria are concrete.
- The design contains no placeholders or hypothetical future requirements.

## Blocked Conditions

- Success criteria can be interpreted in materially different ways.
- A product, security, data, compatibility, or rollout decision is missing.
- The request is too broad for one independently verifiable implementation.
