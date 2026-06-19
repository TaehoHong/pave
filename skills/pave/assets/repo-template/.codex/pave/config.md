# PAVE Config

## Runtime

- Interface: one chat session from request to completion when feasible.
- Orchestrator: main agent owns routing, plan approval, verification,
  and final claims.
- Approval gate: ask once immediately before code or test edits.
- Clarification: ask every product or policy question needed to
  remove ambiguity before implementation.
- Durable artifacts: `plans/`, `reports/`, and optional `.wiki/`.

## Request Routing

- Project initialization: create PAVE runtime, agent files, docs,
  and declared verification commands.
- Feature/change: plan first, then Red-Green-Review.
- Bug: investigate root cause before proposing fixes.
- Analysis: scan repo, cite evidence, avoid edits unless requested.
- Review: findings first, severity ordered, with file and line evidence.
- Refactor: preserve behavior and verify with declared commands.
- Docs sync: update docs only from verified repo evidence.
- Continuation: resume from the newest relevant plan in `plans/`.

## Execution Modes

- `go`: run the next unchecked checklist item.
- `batch`: run an approved phase or tier.
- `fast`: run low-risk items automatically when verification is cheap.
- `status`: summarize progress, blockers, and verification state.

## Subagents

Allowed specialist briefs: product manager, planner, UI/UX designer,
fullstack developer, and QA engineer. Subagents return evidence;
the main agent owns final claims.
