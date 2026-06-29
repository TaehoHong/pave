# PAVE

PAVE means **Plan, Approve, Verify, Execute**.

PAVE is a Codex-first development harness. It lets an agent plan work, ask the important product questions, get one approval before edits, verify the result, and keep durable project direction when you opt in.

Default bundle: **PAVE + Superpowers**. gstack is optional through the full profile.

Korean documentation: [README.kr.md](README.kr.md)

## Quick Start

### Codex

```bash
codex plugin add superpowers@claude-plugins-official
codex plugin marketplace add TaehoHong/pave --ref main
codex plugin add pave@pave
```

Then open a new Codex thread in your target repo:

```text
/pave <your request>
```

Plugin install does not create project files. Optional project docs: run `/project-init` to preserve project direction, onboarding context, and durable product decisions in repo-local docs and PAVE runtime files.

### Claude Code

```bash
claude plugin marketplace add TaehoHong/pave
claude plugin install pave@pave
```

Then run:

```text
/pave <your request>
```

### Advanced

```bash
# Local source plugin development
git clone https://github.com/TaehoHong/pave.git
cd pave
./scripts/install_plugin.sh

# Manual repo runtime install with the full companion profile
./scripts/install.sh <repo-path> --companions full

# manual/offline repo runtime install without companion checks
./scripts/install.sh <repo-path> --companions none

# Check a configured project
./scripts/doctor.js <repo-path> --companions default

# Companion-only troubleshooting
./scripts/check_companions.sh --companions default
```

## Commands

| Command | What it does |
| --- | --- |
| `/pave` | Default workflow for features, bugs, reviews, refactors, analysis, and docs work. |
| `/project-init` | Optional repo-local setup for product direction, onboarding docs, rules, and architecture. |
| `/doctor` | Checks install, companion, runtime, and docs health. |
| `/status` | Summarizes branch state, PAVE runtime state, latest plans/reports, and next actions without edits. |
| `/plan` | Creates an implementation plan only; no code or test edits before approval. |
| `/verify` | Runs fresh verification only; no source changes. |
| `/sync-docs` | Updates overview, roadmap, rules, and architecture docs from evidence and user decisions. |
| `/token-save` | Creates a low-cost implementation contract and reviews the resulting diff. |

## How It Works

- The default source of truth is the plugin-local PAVE skill, references, commands, and role briefs.
- PAVE reads `AGENTS.md`, `CLAUDE.md`, and `.codex/pave/config.md` only when they already exist.
- `.claude/agents/` is a Claude Code adapter copy used for agent discovery after optional project initialization.
- `/project-init` creates optional repo-local docs under `docs/`, including `00-overview.md`, `01-roadmap.md`, development/deployment/design/quality rules, and `06-architecture.md`.
- Implementation work follows plan, approval, execution, verification, and final reporting.

## Optional Repo Runtime

Plugin installation alone does not add files to your project. `/project-init` or `./scripts/install.sh <repo-path>` can create:

```text
repo/
├── AGENTS.md
├── CLAUDE.md
├── .claude/
├── .codex/pave/
└── docs/
    ├── 00-overview.md
    ├── 01-roadmap.md
    ├── 02-development-rules.md
    ├── 03-deployment-rules.md
    ├── 04-design-rules.md
    ├── 05-quality-rules.md
    └── 06-architecture.md
```

These docs preserve product direction, onboarding context, architecture, design rules, development rules, and durable decisions so future work stays aligned.

## Plugin Mechanics

PAVE is both a Codex plugin and a Claude Code plugin. Codex uses `.codex-plugin/plugin.json` with `.agents/plugins/marketplace.json`; Claude Code uses `.claude-plugin/plugin.json` with `.claude-plugin/marketplace.json`. Companion dependencies are handled by install docs, local helpers, and doctor checks rather than plugin manifest dependency fields.
