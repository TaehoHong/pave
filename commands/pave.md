---
description: Run the PAVE workflow for software development work.
---

# /pave

Request:

```text
$ARGUMENTS
```

Read `${CLAUDE_PLUGIN_ROOT}/skills/pave/SKILL.md` completely and follow it as
the canonical PAVE workflow. Resolve every referenced file relative to that
skill and read only the references selected by its Request Routing section.

Treat the request above as the user's current request. Repo-local PAVE files
remain optional; do not initialize them unless the request explicitly asks for
project initialization or durable repo-local runtime files.
