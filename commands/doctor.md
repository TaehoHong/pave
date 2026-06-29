# /doctor

Run PAVE Doctor for the current repository.

Use this when you want to check whether PAVE is installed, initialized, and
detecting companions correctly.

## Command Behavior

1. Do not edit project files.
2. Identify the current repository root.
3. Check whether optional repo-local PAVE runtime files exist.
4. Run `scripts/doctor.js <repo>` when available, using the requested companion
   profile or `default`.
5. If the helper is unavailable, manually check:
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.codex/pave/`
   - `.claude/`
   - `docs/00-overview.md` through `docs/06-architecture.md`
   - Superpowers and optional gstack companion detection
6. Report missing files, companion status, setup gaps, and suggested next
   commands.

## Output

Return a concise health report. Do not perform initialization automatically.
