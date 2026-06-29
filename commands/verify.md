# /verify

Run verification only for the current repository.

Use this when you want fresh evidence without implementation changes.

## Command Behavior

1. Do not modify source files, tests, docs, lockfiles, or generated artifacts.
2. Read declared verification commands from repo instructions when present:
   `AGENTS.md`, `CLAUDE.md`, and `.codex/pave/config.md`.
3. If no command is declared, infer the narrowest reasonable command from
   project files such as `package.json`.
4. Run the selected command only after stating what it proves.
5. If verification fails, report the failure and likely cause. Do not fix it
   unless the user explicitly asks.

## Verification Result

Report:

1. Commands run.
2. Result.
3. Evidence summary.
4. Failures or unavailable verification.
5. Recommended next action.
