# Verification

## Purpose

Prevent success claims without fresh evidence.

## Steps

1. Read declared commands from repo instructions when present, including
   `AGENTS.md`, `CLAUDE.md`, and `.codex/pave/config.md`.
2. Run the narrowest relevant command during item work.
3. Run full declared verification before final success claims.
4. If no repo instruction declares verification commands, infer the narrowest
   reasonable command from local project files or report that verification is
   unavailable.
5. If verification fails, diagnose, fix, and rerun while new evidence
   or plausible fixes remain.
6. If blocked, write a blocked report with command output summary,
   failed expectation, attempted fixes, and next required input.

## Completion Rule

Success requires passing declared commands or explicitly reporting
which commands are unavailable, skipped, or blocked.
