# Git Policy

## Purpose

Keep development changes reviewable and avoid hidden destructive
operations.

## Rules

- Do not revert user changes unless explicitly asked.
- Detect whether the host already provides an isolated worktree before creating
  one. Do not create or remove a worktree without user consent or an explicit
  repo workflow, and do not remove a harness-owned worktree.
- Verify a project-local worktree directory is ignored before using it.
- Verify tests before merge or PR creation. Require explicit confirmation
  before discarding commits, deleting unmerged branches, or removing worktrees.
- Use normal branch and PR flow by default.
