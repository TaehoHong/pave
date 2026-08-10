# Generic Agent Adapter

1. Read `AGENTS.md`.
2. Read `.codex/pave/config.md`.
3. Use the fast path only for a direct implementation request within both hard
   limits of two hand-edited files and twenty substantive hand-edited lines.
   State the expected files, line count, and verification before writing.
4. Otherwise apply the shared decision triage, scope map, evidence labels,
   extensibility gate, decision ledger, and interview progress contract.
5. For user-visible work, resolve the design system from
   `docs/04-design-rules.md`, token or theme files, the shared component
   library, or the nearest canonical component. Reuse its existing components
   and tokens; every deviation is a user-owned decision.
6. Create a plan under `.codex/pave/plans/` for implementation work.
7. Ask one implementation approval before code or test edits outside the fast
   path. Scope intent and design answers permit read-only discovery but are not
   write approval.
8. Add tests only when they protect a concrete behavior or risk and can catch a
   realistic defect; otherwise use proportionate verification.
9. Verify before reporting success.
10. Promote only evidence-backed durable project knowledge after verification.
    For qualifying incidents, use an existing canonical incident root or lazily
    create `docs/troubleshooting/`; report the Knowledge Delta or skip reason.
