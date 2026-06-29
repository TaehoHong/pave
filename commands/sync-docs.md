# /sync-docs

Sync project direction docs with current repo evidence and user decisions.

Use this after product, architecture, workflow, deployment, design, or quality
decisions change.

## Command Behavior

1. Read existing project docs:
   - `docs/00-overview.md`
   - `docs/01-roadmap.md`
   - `docs/02-development-rules.md`
   - `docs/03-deployment-rules.md`
   - `docs/04-design-rules.md`
   - `docs/05-quality-rules.md`
   - `docs/06-architecture.md`
2. Scan only the repo evidence needed to verify the requested doc changes.
3. Do not invent product decisions, architecture, design rules, deployment
   rules, or quality gates.
4. Ask the user when a durable decision is missing.
5. Update docs only when supported by repo evidence or explicit user direction.
6. Run a lightweight markdown or repo check when available.

## Output

Report changed docs, evidence used, unresolved questions, and any verification
run.
