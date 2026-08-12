# Context Retrieval

## Purpose

Reuse verified codebase knowledge without rereading the whole repository or
trusting stale summaries.

## Durable Guide

When `docs/07-codebase-guide.md` exists, read it after repo instructions and
before source discovery. Treat it as a navigation index, not proof that the
current code still behaves as documented.

The guide should record:

- module boundaries, entry points, and ownership;
- shared capabilities and their canonical files or symbols;
- code conventions with representative source files;
- dependency direction and prohibited shortcuts;
- test locations and narrow verification commands;
- generated, vendored, archived, or otherwise excluded paths;
- evidence paths for every entry that may become stale.

## Retrieval Protocol

1. Read applicable repo instructions, `.codex/pave/config.md`, and the codebase
   guide. Do not begin with a repository-wide source read.
2. Select only the guide entries related to the request. If
   `docs/troubleshooting/_index.md` or a linked canonical incident index exists,
   select records by affected area, symptom, evidence paths, or named boundary,
   then read only those matched records. Do not scan all incidents.
3. Check the selected guide and troubleshooting knowledge for staleness:
   - Find the last commit that changed the guide with
     `git log -1 --format=%H -- docs/07-codebase-guide.md`.
   - For only the selected entries' evidence paths, check committed changes
     with `git diff --name-only <guide-commit>..HEAD -- <evidence-paths>`,
     staged changes with
     `git diff --cached --name-only -- <evidence-paths>`, and unstaged changes
     with `git diff --name-only -- <evidence-paths>`.
   - If Git history is unavailable, the guide has no committed revision, or an
     entry lacks evidence paths, treat only that entry as unverified.
4. Treat troubleshooting records as historical evidence, not proof of current
   behavior. Recheck their affected paths, regression guards, and supersession
   links against current code before relying on their conclusions.
5. Inspect the target files, their direct callers and callees, relevant tests,
   and any canonical examples named by the selected entries.
6. Use targeted search to resolve missing ownership, hidden sibling callers,
   or contradictions. Expand one boundary at a time; do not reread unrelated
   modules.
7. Prefer current code over the guide whenever they conflict. Report the stale
   entry and use current evidence.

For a small fast-path edit, the target and nearest safe context remain enough
unless a shared owner or canonical implementation exists elsewhere.

## Existing Owner Check

The durable guide names shared owners only in an initialized repository. In
plugin-only mode no guide exists, so run this check directly before writing
logic that implements a rule, validation, transformation, formatting, error
mapping, or any other behavior a sibling module may already own.

1. Name the behavior in the terms the codebase would use, not the terms of the
   request.
2. Search for a current owner with at least two distinct signals, such as a
   symbol or identifier search, a call-site search for the surrounding
   operation, and the test names covering that behavior.
3. Record one of these outcomes before editing:
   - `owner-found`: extend or call the existing owner instead of writing a
     parallel implementation.
   - `owner-absent`: no current owner exists; state the search signals used and
     place the new behavior where the module boundary says it belongs.
   - `owner-rejected`: an owner exists but is unsuitable; state the concrete
     reason, since this creates a second implementation of one rule.
4. Treat `owner-rejected` as a material decision. A parallel path, a duplicated
   rule, or a copied block is a design change, not an implementation detail.

This check is bounded. Two targeted searches are enough; it never authorizes a
repository-wide read or an unrelated refactor. A purely local edit with no
reusable behavior records `owner-absent` and proceeds.

## Maintenance Gate

Update the affected guide entries in the same work when verified changes alter:

- a module boundary or entry point;
- ownership of shared behavior;
- a canonical helper, abstraction, or example;
- a code convention or dependency rule;
- test placement or verification commands;
- a proven recurring failure mode or its regression guard;
- an excluded or generated path.

Do not rewrite unrelated entries. Preserve useful evidence paths. New
repository facts require code evidence; product or policy decisions require
explicit user confirmation.

## Blocked Conditions

- The guide names a shared owner that no longer exists and targeted search
  cannot identify the replacement.
- Relevant code and durable policy conflict in a way that changes behavior.
- The task needs a broad architecture decision rather than context retrieval.
