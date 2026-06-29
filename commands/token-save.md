# /token-save

Run or describe the token-save workflow for the user's request.

For normal use, prefer enabling token-save mode in `.codex/pave/config.md` and
then run `/pave`. Use this command only for a one-off token-conscious workflow
or to get an implementation contract without changing repo-local settings.

Request:

```text
$ARGUMENTS
```

## Model Budget Contract

- Use the current high-reasoning, higher-cost model for planning, contract
  writing, and final diff review.
- Use a lower-cost implementation model or local implementation subagent for
  bounded code edits when the runtime supports model or agent selection.
- If no lower-cost implementer is available, stop after the Implementation
  Contract and tell the user to run the provided implementer brief in a cheaper
  model/session.
- Do not paste full files, full diffs, long grep output, or test logs into the
  main conversation. Summarize and cite paths instead.

## Phase 1: Implementation Contract Only

Do not implement during this phase.

Read only:

1. Required repo instructions such as `CLAUDE.md`, `AGENTS.md`, and directly
   relevant local workflow files.
2. The smallest set of source files needed to identify the target surface.
3. Tests or fixtures directly related to the requested behavior.

Then write an Implementation Contract with exactly these sections:

1. Goal
2. Target files
3. Functions, classes, or interfaces to change
4. Existing behavior to preserve
5. New behavior to add
6. Edge cases
7. Test commands
8. Files or areas the local implementer must not touch
9. Stop-and-report conditions

For complex algorithms, transactions, security, authentication, authorization,
or data-integrity logic, include only core pseudocode. Do not write full code in
the contract.

## Phase 2: Low-Cost Local Implementation

Delegate with a self-contained brief. Do not assume the implementer has the main
conversation context.

Use this brief:

```text
Use a low-cost implementation model or local implementation subagent
(examples: Haiku, Sonnet, GPT-mini, or the configured local cheap model).

Implement only from the Implementation Contract below.
Do not widen scope.
Read only the files named in the contract and direct dependencies required to
edit or test them.

Stop immediately and report instead of editing if the work requires:
- architecture judgment beyond the contract
- public API design changes not listed in the contract
- database schema or migration changes
- security, authentication, authorization, transaction, or data-integrity logic
  changes beyond the contract
- touching any file or area marked off-limits

After implementation, run the contract's test commands.
Do not return full diffs, long logs, grep output, or build logs.
Return only:

1. Changed files
2. Change summary
3. Test commands run
4. Test result
5. Unresolved issues

Implementation Contract:
<paste the contract here>
```

## Phase 3: Diff-Only High-Reasoning Review

Review only the resulting diff and the implementer summary.

Use:

1. `git diff --stat`
2. `git diff --check`
3. The relevant diff hunks
4. The implementer's summarized test result

Do not reread the whole repository. Pull additional surrounding context only
when a diff hunk is ambiguous.

Review only for:

1. Whether the Implementation Contract was satisfied
2. Whether existing behavior was broken
3. Missing exceptions or edge cases
4. Whether tests are sufficient for the change risk
5. Unnecessary changes or scope creep

If the review finds issues, create a small follow-up Implementation Contract and
send only that bounded correction back to the low-cost implementer.

## Final Response

Report only:

1. Contract status
2. Changed files
3. Tests run and result
4. Review result
5. Remaining risks or unresolved issues
