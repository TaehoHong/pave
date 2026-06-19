# PAVE Runtime

This directory contains repo-local runtime artifacts for PAVE:
Plan, Approve, Verify, Execute.

## Contents

- `config.md`: repo-local policy and routing.
- `plans/`: approved task plans.
- `reports/`: final and blocked reports.
- `templates/`: plan and report templates.
- `adapters/`: guidance for Codex, Claude Code, and generic agents.

The chat session is active runtime state. Plans and reports are
durable artifacts. Use `.wiki/` only for durable project memory.
