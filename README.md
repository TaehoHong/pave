# PAVE

> Plan, Approve, Verify, Execute — a lightweight development workflow for
> Codex and Claude Code.

PAVE helps coding agents clarify important decisions, make the smallest
approved change, and prove the result with fresh verification. It works as an
installable plugin without adding files to your project. Optional project
initialization can preserve long-lived product direction and engineering rules
in the repository.

PAVE is standalone: no companion plugin, hosted service, MCP server, or
credentials are required.

한국어 문서: [README.kr.md](README.kr.md)

Evaluation methodology: [BENCHMARKING.md](BENCHMARKING.md)

## Quick Start

### Codex

```bash
codex plugin marketplace add TaehoHong/pave --ref main
codex plugin add pave@pave
```

Open a new Codex thread in the target repository:

```text
$pave:pave Fix the login timeout bug and verify the regression.
```

### Claude Code

```bash
claude plugin marketplace add TaehoHong/pave
claude plugin install pave@pave
```

Restart Claude Code, open the target repository, and run:

```text
/pave:pave Fix the login timeout bug and verify the regression.
```

Both agents may also select PAVE automatically when a request matches one of
its installed skills.

## What Happens

```text
Request
  ├─ Small, clear, low-risk change
  │    └─ Inspect → Edit → Verify
  └─ Standard work
       └─ Inspect → Plan → Approve → Execute → Verify → Report
```

PAVE scans the repository before asking questions. It uses a fast path for
direct, low-risk edits only when both hard limits hold: no more than two
hand-edited files and no more than twenty substantive hand-edited lines.
For standard work, PAVE asks only material user-owned questions that block the
current slice, distinguishes repo and authoritative external facts from user
policy, and shows the remaining decision count. It keeps justified extension
boundaries when they avoid breaking future contracts, while deferring unused
providers, workflows, and policies. Scope intent permits read-only discovery;
design choices and clarification answers do not count as write approval.
After the complete Implementation Contract is ready, PAVE uses the host's
normal plan or choice UI when available; otherwise a direct reply that clearly
authorizes that contract is enough. No second PAVE command is required. DDL
uses a distinct choice only after PAVE has surfaced the exact DDL scope, impact,
and rollback. Material changes to files, operations, risk, verification, or
observable behavior require renewed approval. PAVE never embeds
approval-control markers in assistant text.
PAVE also investigates root causes for bugs, adds tests only when they protect
meaningful behavior, compares the actual diff with the approved contract, and
requires fresh evidence for completion.
When work touches a user-visible surface, PAVE resolves the project's design
system from durable design policy, design token or component files, or the
nearest canonical component, reuses its existing components and tokens instead
of adding one-off styles, and raises every deviation as a user decision.
When the optional runtime is initialized, PAVE reuses a freshness-checked
`docs/07-codebase-guide.md` to find module owners, shared code, conventions,
canonical examples, and narrow verification without rereading unrelated code.

## Skills

| Purpose | Codex | Claude Code |
| --- | --- | --- |
| Default workflow | `$pave:pave` | `/pave:pave` |
| Initialize optional project runtime | `$pave:project-init` | `/pave:project-init` |
| Show project and workflow status | `$pave:status` | `/pave:status` |
| Create a plan without editing source | `$pave:plan` | `/pave:plan` |
| Sync durable project documentation | `$pave:sync-docs` | `/pave:sync-docs` |
| Use a one-off lower-cost workflow | `$pave:token-save` | `/pave:token-save` |
| Show phase timing and token usage | `$pave:usage` | Not supported yet |

For verification without source changes, ask the default PAVE workflow to run
the repository's declared verification commands.

## Workflow and Execution Responsibilities

PAVE is a cooperative workflow: its skill defines investigation, an explicit
Implementation Contract, user approval, scope-change reapproval, diff review,
fresh verification, and reporting. It does not parse arbitrary commands or
tool payloads to infer whether they are safe or mutating, and it does not claim
that a plan marker or successful approval UI call proves technical authority.

The host owns tool permissions, sandboxing, and file, network, or external
system access. Repository and operational controls own CI, credentials,
migrations, and deployment policy. If stronger enforcement is required, it
belongs in those layers rather than in a language- or command-specific PAVE
parser.

## Local Usage Statistics

On Codex, PAVE can passively record elapsed time and token deltas for the
`inspect`, `plan`, `approval`, `execute`, `verify`, and `report` phases. After
installing or updating the plugin, review and trust its local lifecycle hook
with `/hooks`, then use:

```text
$pave:usage latest
$pave:usage daily
$pave:usage weekly
$pave:usage cumulative
```

Codex's native `/usage` remains the account-level usage command. PAVE stores
only aggregated timestamps, token counters, model, and repository name under
the plugin's writable data directory. It does not copy prompts, responses,
source files, or transcript contents. Token statistics are shown as
`unavailable` when the current Codex transcript does not expose a compatible
`token_count` event; PAVE does not estimate missing values. Claude Code usage
collection is deferred.

## Durable Project Knowledge

After fresh verification, PAVE evaluates whether a task produced reusable
project knowledge. It promotes only user-confirmed, repo-evidenced, or
authoritatively evidenced facts into the document that already owns the
subject. Mechanical changes, raw task history, and unproven hypotheses stay out
of canonical docs.

For a non-obvious or recurring incident, an initialized project can lazily add
`docs/troubleshooting/`. Each record preserves the symptom, diagnostic
evidence, proven cause or explicit uncertainty, resolution, regression guard,
and verification. Current operational, architecture, quality, and ownership
rules are still distilled into their canonical project docs. PAVE never creates
this directory during initialization or in plugin-only mode.

Git remains the detailed change history. PAVE documentation records what future
work needs to know and why.

## Plugin-Only vs Project Runtime

| Mode | What changes in the repository | Best for |
| --- | --- | --- |
| Plugin only | Nothing | Normal feature, bug, review, refactor, analysis, and documentation work |
| `$pave:project-init` / `/pave:project-init` | Adds approved PAVE runtime and project docs | Teams that want durable product direction, rules, and onboarding context |

Plugin-only mode is the default. Project initialization is optional and asks
before writing durable repository files.

On an existing repository, project initialization first inventories the
documentation the project already has — other doc roots, `README`,
`ARCHITECTURE`, ADRs, style guides, design tokens, and component libraries —
and links each PAVE doc to the existing document that owns its subject through
a `Linked Sources` table. The linked document stays the source of truth, so
initialization narrows the interview instead of duplicating what is already
written.

The optional runtime can include:

```text
repo/
├── AGENTS.md
├── CLAUDE.md
├── .claude/
├── .codex/pave/
│   ├── adapters/
│   ├── plans/
│   ├── reports/
│   └── config.md
└── docs/
    ├── 00-overview.md
    ├── 01-roadmap.md
    ├── 02-development-rules.md
    ├── 03-deployment-rules.md
    ├── 04-design-rules.md
    ├── 05-quality-rules.md
    ├── 06-architecture.md
    ├── 07-codebase-guide.md
    └── troubleshooting/       # created lazily after a qualifying incident
```

Codex and Claude Code share the PAVE contract but use separate runtime
adapters. Model choice, reasoning effort, permissions, and agent discovery
remain native to each host.

## Update

### Codex

```bash
codex plugin marketplace upgrade pave
codex plugin add pave@pave
```

Start a new thread after reinstalling.

### Claude Code

```bash
claude plugin marketplace update pave
claude plugin update pave@pave
```

Restart Claude Code after updating.

Plugin updates refresh plugin-local workflows. Existing repo-local runtime
files remain unchanged until you explicitly run project initialization or
synchronize them again. State written by older enforcement hooks is ignored and
is not deleted automatically.

## Verify or Remove

```bash
# Codex
codex plugin list --marketplace pave
codex plugin remove pave@pave

# Claude Code
claude plugin list
claude plugin uninstall pave@pave
```

## Manual Project Runtime Installation

Node.js 18 or newer is required for passive usage hooks and the optional
repository scripts. Hook commands run through the shell provided by the
supported Codex or Claude Code host.

```bash
git clone https://github.com/TaehoHong/pave.git
cd pave

# Preview without writing
./scripts/install.sh <repo-path> --dry-run

# Install runtime and starter docs without overwriting existing files
./scripts/install.sh <repo-path>
```

The installer validates the initialized runtime before reporting success.

Use `--force` only after reviewing the target files; it overwrites matching
runtime and documentation templates.

## Limitations

- PAVE does not automatically commit, push, deploy, or contact external
  services unless the user explicitly requests and authorizes that work.
- Updating the plugin does not overwrite project-owned `AGENTS.md`,
  `CLAUDE.md`, `.codex/pave/`, or `docs/`.
- Codex and Claude Code are the supported plugin surfaces. Other agents may
  read the Markdown skills, but their installation and behavior are not
  documented as supported.

## Local Development

```bash
git clone https://github.com/TaehoHong/pave.git
cd pave
./scripts/install_plugin.sh
npm test
npm run check
claude plugin validate --strict .claude-plugin/plugin.json
```

The repository contains one source set of PAVE skills and role briefs, plus
native Codex and Claude Code manifests and adapters.

## License

[MIT](LICENSE) © TaehoHong
