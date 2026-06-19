# Git Policy

## Purpose

Keep development changes reviewable and avoid hidden destructive
operations.

## Rules

- Do not revert user changes unless explicitly asked.
- Use normal branch and PR flow by default.
- Use gstack only when all are true:
  - the `gstack` command is available;
  - the repo explicitly opts into stacked changes;
  - the task benefits from stacked diffs;
  - user or repo instructions allow it.
- If any condition is false, do not let gstack block work.
