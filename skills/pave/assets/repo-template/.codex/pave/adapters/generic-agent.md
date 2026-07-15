# Generic Agent Adapter

1. Read `AGENTS.md`.
2. Read `.codex/pave/config.md`.
3. For a concrete low-risk edit normally within two files and roughly twenty
   substantive lines, treat the request as approval and skip formal planning.
4. Otherwise create a plan under `.codex/pave/plans/` for implementation work.
5. Ask one implementation approval before code or test edits outside the fast
   path.
6. Add tests only when they protect a concrete behavior or risk and can catch a
   realistic defect; otherwise use proportionate verification.
7. Verify before reporting success.
