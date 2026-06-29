# PAVE Config

## Runtime

- Interface: one chat session from request to completion when feasible.
- Orchestrator: main agent owns routing, plan approval, verification,
  and final claims.
- Approval gate: ask once immediately before code or test edits.
- Clarification: ask every product or policy question needed to
  remove ambiguity before implementation.
- Durable artifacts: `plans/`, `reports/`, and optional `.wiki/`.

## Companions

- Profile: `default`.
- Superpowers: required for default PAVE operation when available.
- gstack: optional by default; required only when the repo selects the
  `full` companion profile.
- Offline or unusual setups may use profile `none`, but must report
  fallback mode before claiming harness behavior.

## Request Routing

- Project initialization: create PAVE runtime, agent files, docs,
  declared verification commands, and companion checks.
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
- Token-save: disabled.
- Low-cost implementer: not declared.
  When enabled, `/pave` keeps the current configured model for planning and
  final review, and uses the configured low-cost implementer only for bounded
  implementation tasks that do not need architecture, product, security,
  data-integrity, or API-design judgment.

## Subagents

Allowed specialist briefs: product manager, planner, UI/UX designer,
fullstack developer, and QA engineer. Subagents return evidence;
the main agent owns final claims.
