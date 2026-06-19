# PAVE Runtime

This repository uses PAVE: **Plan, Approve, Verify, Execute**.

PAVE keeps AI-assisted development work organized through planning, one approval gate before edits, verification, and final or blocked reports.

Korean documentation: [README.kr.md](README.kr.md)

## Quick Use

In Codex:

```text
$pave implement this feature
$pave find and fix this bug
$pave review the current changes
$pave continue the previous task
```

In Claude Code:

```text
/pave implement this feature
/pave find and fix this bug
/pave review the current changes
/pave continue the previous task
```

## Companion Tools

- Superpowers is required by the default PAVE profile.
- gstack is optional unless this repo was installed with the full profile.
- Plans and reports stay in `.codex/pave/` for both Codex and Claude Code.

## Workflow

1. The agent reads `AGENTS.md`, `CLAUDE.md`, and `.codex/pave/config.md`.
2. The agent scans relevant code and docs.
3. The agent asks product, policy, design, deployment, and verification questions before implementation.
4. The agent creates or updates a plan in `.codex/pave/plans/`.
5. The agent asks once for approval immediately before code or test edits.
6. The agent implements, reviews, and verifies.
7. The agent uses bounded specialist subagents when useful.
8. The agent reports verification results.
9. The agent writes final or blocked reports in `.codex/pave/reports/` when useful.

## Codex vs Claude Code

| Topic | Codex | Claude Code |
| --- | --- | --- |
| Command | `$pave ...` | `/pave ...` |
| First file | `AGENTS.md` | `CLAUDE.md`, then `AGENTS.md` |
| Runtime path | `.codex/pave/` | `.codex/pave/` |
| Role agents | PAVE skill references | `.claude/agents/` |

## Files Here

- `config.md`: repo-local PAVE policy.
- `plans/`: task plans.
- `reports/`: final and blocked reports.
- `templates/`: plan and report templates.
- `adapters/`: Codex, Claude Code, and generic agent guidance.

## Check This Repo

In Codex, ask:

```text
$pave check this PAVE installation
```

Terminal fallback, from the PAVE source repo:

```bash
./scripts/check_companions.sh
./scripts/doctor.js <repo-path>
```
