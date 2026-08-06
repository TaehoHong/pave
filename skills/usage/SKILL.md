---
name: usage
description: Use when the user asks for PAVE phase timing or token usage statistics, including $pave:usage.
---

# PAVE Usage

Show local Codex usage statistics collected by PAVE. This is distinct from
Codex's native `/usage`, which reports account-level activity.

1. Accept one optional view: `latest`, `daily`, `weekly`, or `cumulative`.
   Default to `latest`.
2. If developer context contains a `PAVE_USAGE_REPORT` block from the PAVE
   hook, return that report without adding unrelated project status.
3. Otherwise resolve `../../scripts/usage.js` relative to this `SKILL.md` and
   run it with an absolute path:

   ```text
   node <resolved-script-path> report <view>
   ```

4. Return the report in the user's language. Preserve `unavailable` token
   values rather than estimating them.
5. Do not edit project files, inspect prompt contents, or invoke Codex's native
   `/usage` on the user's behalf.
