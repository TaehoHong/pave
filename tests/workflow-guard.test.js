const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { handleHook, runSelfCheck } = require('../scripts/workflow-guard');

const pluginRoot = path.resolve(__dirname, '..');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-guard-test-'));
  const cwd = path.join(root, 'repo');
  fs.mkdirSync(cwd);
  return { cwd, dataDir: path.join(root, 'data'), sessionId: 'session-1' };
}

function hook(state, input, now) {
  return handleHook({
    session_id: state.sessionId,
    cwd: state.cwd,
    ...input,
  }, {
    dataDir: state.dataDir,
    pluginRoot,
    now: () => now,
  });
}

function activate(state, now = 1) {
  return hook(state, {
    hook_event_name: 'UserPromptSubmit',
    prompt: '$pave:pave implement the feature',
  }, now);
}

function readReference(state, name, now) {
  return hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Read',
    tool_input: {
      file_path: path.join(pluginRoot, 'skills', 'pave', 'references', `${name}.md`),
    },
    tool_response: { success: true },
  }, now);
}

function prepareApprovedFeature(state) {
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'update_plan',
    tool_input: { plan: [{ step: '[PAVE:approval] Confirm implementation boundary', status: 'in_progress' }] },
    tool_response: { success: true },
  }, 6);
  hook(state, {
    hook_event_name: 'UserPromptSubmit',
    prompt: '추천대로',
  }, 7);
  readReference(state, 'execution-loop', 8);
}

function prepareDdlApprovedFeature(state) {
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'request_user_input',
    tool_input: {
      questions: [{ id: 'pave_ddl_approval', question: 'Implement this boundary including DDL?' }],
    },
    tool_response: { success: true, answers: { pave_ddl_approval: 'Implement with DDL (Recommended)' } },
  }, 7);
  readReference(state, 'execution-loop', 8);
}

function prepareFastPath(state) {
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'fast-path', 'testing', 'verification'].entries()) {
    readReference(state, name, index + 2);
  }
}

function permission(output) {
  return output.hookSpecificOutput?.permissionDecision;
}

function readFile(state, filePath, now) {
  return hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Read',
    tool_input: { file_path: filePath },
    tool_response: { success: true, content: fs.readFileSync(filePath, 'utf8') },
  }, now);
}

test('blocks a source edit before the routed references and approval are complete', () => {
  const state = fixture();
  activate(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 2);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /reference|approval/i);
});

test('does not affect a session that did not invoke PAVE', () => {
  const state = fixture();

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 1), {});
});

test('activates when the host invokes the PAVE skill directly', () => {
  const state = fixture();
  hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Skill',
    tool_input: { skill: 'pave:pave' },
  }, 1);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 2);

  assert.equal(permission(output), 'deny');
});

test('activates for the Claude namespaced slash command', () => {
  const state = fixture();
  hook(state, {
    hook_event_name: 'UserPromptSubmit',
    prompt: '/pave:pave implement the feature',
  }, 1);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 2);

  assert.equal(permission(output), 'deny');
});

test('activates when Claude expands the PAVE slash command directly', () => {
  const state = fixture();
  hook(state, {
    hook_event_name: 'UserPromptExpansion',
    expansion_type: 'slash_command',
    command_name: 'pave:pave',
    prompt: '/pave:pave implement the feature',
  }, 1);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 2);

  assert.equal(permission(output), 'deny');
});

test('rejects an approval-state transition before required planning evidence is complete', () => {
  const state = fixture();
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing'].entries()) {
    readReference(state, name, index + 2);
  }
  const approval = hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'update_plan',
    tool_input: { plan: [{ step: '[PAVE:approval] Confirm implementation boundary', status: 'in_progress' }] },
    tool_response: { success: true },
  }, 6);
  assert.equal(approval.decision, 'block');
  assert.match(approval.reason, /planning/i);
  readReference(state, 'execution-loop', 8);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 9);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /planning|approval/i);
});

test('does not treat conversational approval as write approval before an approval request is pending', () => {
  const state = fixture();
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }
  hook(state, { hook_event_name: 'UserPromptSubmit', prompt: '진행해' }, 7);
  readReference(state, 'execution-loop', 8);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'middleware.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 9);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /approval/i);
});

test('a revision response clears the pending approval so later unrelated text cannot approve stale scope', () => {
  const state = fixture();
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'update_plan',
    tool_input: { plan: [{ step: '[PAVE:approval] Confirm implementation boundary', status: 'in_progress' }] },
    tool_response: { success: true },
  }, 6);
  hook(state, { hook_event_name: 'UserPromptSubmit', prompt: '계획을 먼저 수정해' }, 7);
  hook(state, { hook_event_name: 'UserPromptSubmit', prompt: '진행해' }, 8);
  readReference(state, 'execution-loop', 9);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: path.join(state.cwd, 'stale.ts'), old_string: 'a', new_string: 'b' },
  }, 10);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /approval/i);
});

test('a new explicit PAVE invocation resets prior approval and reference evidence', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  activate(state, 9);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(state.cwd, 'second-task.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 10);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /reference|approval/i);
});

test('a new PAVE invocation resets the guarded repository cwd', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const nextCwd = path.join(path.dirname(state.cwd), 'repo-two');
  fs.mkdirSync(nextCwd);

  hook(state, {
    cwd: nextCwd,
    hook_event_name: 'UserPromptSubmit',
    prompt: '$pave:pave second repository task',
  }, 9);
  const output = hook(state, {
    cwd: nextCwd,
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: path.join(nextCwd, 'second-task.ts'),
      old_string: 'old',
      new_string: 'new',
    },
  }, 10);

  assert.equal(permission(output), 'deny');
});

test('a completed unrouted turn releases the guard while routed planning state persists', () => {
  const completed = fixture();
  activate(completed, 1);
  hook(completed, { hook_event_name: 'Stop', last_assistant_message: 'Analysis complete.' }, 2);
  assert.deepEqual(hook(completed, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: path.join(completed.cwd, 'later.ts'), old_string: 'a', new_string: 'b' },
  }, 3), {});

  const pending = fixture();
  activate(pending, 1);
  readReference(pending, 'design', 2);
  hook(pending, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Choose one option.',
  }, 3);
  assert.equal(permission(hook(pending, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: path.join(pending.cwd, 'later.ts'), old_string: 'a', new_string: 'b' },
  }, 4)), 'deny');
});

test('Claude structured choice records approval without resetting workflow evidence', () => {
  const state = fixture();
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }

  assert.deepEqual(hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'AskUserQuestion',
    tool_input: {
      questions: [{ header: 'PAVE approve', question: 'Implement this boundary?' }],
    },
    tool_response: { success: true, answers: { implementation: 'Implement' } },
  }, 7), {});
  readReference(state, 'execution-loop', 8);

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: path.join(state.cwd, 'approved.ts'), old_string: 'a', new_string: 'b' },
  }, 9), {});
});

test('Codex structured choice records explicit DDL approval', () => {
  const state = fixture();
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }
  assert.deepEqual(hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'request_user_input',
    tool_input: {
      questions: [{ id: 'pave_ddl_approval', question: 'Implement this boundary including DDL?' }],
    },
    tool_response: { success: true, answers: { pave_ddl_approval: 'Implement with DDL (Recommended)' } },
  }, 7), {});
  readReference(state, 'execution-loop', 8);

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: { file_path: 'setup.sql', content: 'CREATE TABLE approved (id int);\n' },
  }, 9), {});
});

test('Claude native plan approval records standard implementation approval', () => {
  const state = fixture();
  activate(state, 1);
  for (const [index, name] of ['context-retrieval', 'design', 'testing', 'planning'].entries()) {
    readReference(state, name, index + 2);
  }

  assert.deepEqual(hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'ExitPlanMode',
    tool_input: { plan: 'Implement the surfaced boundary.' },
    tool_response: { success: true },
  }, 7), {});
  readReference(state, 'execution-loop', 8);

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: path.join(state.cwd, 'approved.ts'), old_string: 'a', new_string: 'b' },
  }, 9), {});
});

test('blocks Write from replacing an existing source file after approval', () => {
  const state = fixture();
  const target = path.join(state.cwd, 'middleware.ts');
  fs.writeFileSync(target, 'existing behavior\n');
  prepareApprovedFeature(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: { file_path: target, content: 'replacement\n' },
  }, 8);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /existing file/i);
  assert.equal(fs.readFileSync(target, 'utf8'), 'existing behavior\n');
});

test('blocks shell redirection that can bypass source-file overwrite protection', () => {
  const state = fixture();
  prepareApprovedFeature(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: "cat > middleware.ts <<'EOF'\nreplacement\nEOF" },
  }, 8);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /Edit or Write|redirection/i);
});

test('blocks the Codex exec_command alias for shell overwrite', () => {
  const state = fixture();
  prepareApprovedFeature(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'functions.exec_command',
    tool_input: { cmd: "cat > middleware.ts <<'EOF'\nreplacement\nEOF" },
  }, 9);

  assert.equal(permission(output), 'deny');
});

test('blocks unapproved Bash commands that can mutate the repository', () => {
  for (const command of [
    'cp source.ts middleware.ts',
    'mv source.ts middleware.ts',
    'dd if=source.ts of=middleware.ts',
    "python -c 'open(\"middleware.ts\", \"w\").write(\"x\")'",
    'git apply patch.diff',
  ]) {
    const state = fixture();
    activate(state);
    const output = hook(state, {
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command },
    }, 2);
    assert.equal(permission(output), 'deny', command);
  }
});

test('tracks an approved mutating Bash command as an edit', () => {
  const state = fixture();
  prepareApprovedFeature(state);

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'cp source.ts middleware.ts' },
  }, 9), {});
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'cp source.ts middleware.ts' },
    tool_response: { exit_code: 0 },
  }, 10);

  const output = hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 11);
  assert.equal(output.decision, 'block');
  assert.match(output.reason, /review|verification/i);
});

test('allows review of an untracked file created by an approved Bash command', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const target = path.join(state.cwd, 'copied.ts');
  fs.writeFileSync(target, 'copied\n');
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'cp source.ts copied.ts' },
    tool_response: { exit_code: 0 },
  }, 9);
  readReference(state, 'review', 10);
  readReference(state, 'verification', 11);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npm test' },
    tool_response: { exit_code: 0 },
  }, 12);
  readReference(state, 'memory', 13);
  readReference(state, 'reporting', 14);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git status --short' },
    tool_response: { exit_code: 0, output: '?? copied.ts\n' },
  }, 15);

  assert.equal(hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 16).decision, 'block');
  readFile(state, target, 17);
  assert.deepEqual(hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 18), {});
});

test('blocks Codex apply_patch before references and approval', () => {
  const state = fixture();
  activate(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'functions.apply_patch',
    tool_input: {
      patch: [
        '*** Begin Patch',
        '*** Update File: middleware.ts',
        '@@',
        '-old',
        '+new',
        '*** End Patch',
      ].join('\n'),
    },
  }, 2);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /reference|approval/i);
});

test('general implementation approval does not authorize DDL writes or edits', () => {
  const cases = [
    {
      name: 'raw SQL Write',
      tool_name: 'Write',
      tool_input: {
        file_path: 'setup.sql',
        content: 'CREATE TABLE api_keys (id uuid PRIMARY KEY);\n',
      },
    },
    {
      name: 'migration path Edit',
      tool_name: 'Edit',
      tool_input: {
        file_path: 'db/migrations/20260821_add_api_keys.sql',
        old_string: '-- pending',
        new_string: '-- add the approved table',
      },
    },
    {
      name: 'ORM schema owner Edit',
      tool_name: 'Edit',
      tool_input: {
        file_path: 'src/db/schema.ts',
        old_string: 'export const apiKeys = table();',
        new_string: 'export const apiKeys = table().addColumn();',
      },
    },
    {
      name: 'raw SQL apply_patch',
      tool_name: 'functions.apply_patch',
      tool_input: {
        patch: [
          '*** Begin Patch',
          '*** Add File: setup.sql',
          '+ALTER TABLE workspaces ADD COLUMN api_enabled boolean;',
          '*** End Patch',
        ].join('\n'),
      },
    },
  ];

  for (const scenario of cases) {
    const state = fixture();
    prepareApprovedFeature(state);
    const output = hook(state, {
      hook_event_name: 'PreToolUse',
      tool_name: scenario.tool_name,
      tool_input: scenario.tool_input,
    }, 9);
    assert.equal(permission(output), 'deny', scenario.name);
    assert.match(output.hookSpecificOutput.permissionDecisionReason, /DDL approval/i, scenario.name);
  }
});

test('the fast path cannot bypass DDL approval', () => {
  const state = fixture();
  prepareFastPath(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: 'setup.sql',
      content: 'CREATE TABLE api_keys (id uuid PRIMARY KEY);\n',
    },
  }, 7);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /DDL approval/i);
});

test('general implementation approval does not authorize DDL execution commands', () => {
  for (const command of [
    "psql -c 'ALTER TABLE workspaces ADD COLUMN api_enabled boolean'",
    'npx prisma migrate deploy',
    'pnpm drizzle-kit push',
    'bundle exec rails db:migrate',
    'alembic upgrade head',
  ]) {
    const state = fixture();
    prepareApprovedFeature(state);
    const output = hook(state, {
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command },
    }, 9);
    assert.equal(permission(output), 'deny', command);
    assert.match(output.hookSpecificOutput.permissionDecisionReason, /DDL approval/i, command);
  }
});

test('explicit DDL approval authorizes the surfaced DDL workflow', () => {
  const state = fixture();
  prepareDdlApprovedFeature(state);

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: 'setup.sql',
      content: 'CREATE TABLE api_keys (id uuid PRIMARY KEY);\n',
    },
  }, 9), {});
  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npx prisma migrate deploy' },
  }, 10), {});
});

test('DDL approval is reset by a new PAVE invocation', () => {
  const state = fixture();
  prepareDdlApprovedFeature(state);
  activate(state, 9);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: 'setup.sql',
      content: 'CREATE TABLE api_keys (id uuid PRIMARY KEY);\n',
    },
  }, 10);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /DDL approval/i);
});

test('ordinary schema-named source files and DML do not require DDL approval', () => {
  const state = fixture();
  prepareApprovedFeature(state);

  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: {
      file_path: 'src/schema.ts',
      old_string: 'export const value = 1;',
      new_string: 'export const value = 2;',
    },
  }, 9), {});
  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: 'queries.sql',
      content: 'UPDATE api_keys SET last_used_at = now() WHERE id = $1;\n',
    },
  }, 10), {});
  assert.deepEqual(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: 'database-notes.md',
      content: 'Example only: `CREATE TABLE api_keys (id uuid);`\n',
    },
  }, 11), {});
});

test('requires design-system evidence before a user-visible edit', () => {
  const state = fixture();
  prepareApprovedFeature(state);

  const output = hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Write',
    tool_input: {
      file_path: path.join(state.cwd, 'ApiKeysPanel.tsx'),
      content: 'export function ApiKeysPanel() { return null; }\n',
    },
  }, 8);

  assert.equal(permission(output), 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /design-system/);
});

test('blocks completion until post-edit review, diff inspection, verification, and memory evaluation', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const target = path.join(state.cwd, 'new-module.ts');
  fs.writeFileSync(target, 'export const value = 0;\n');

  assert.equal(permission(hook(state, {
    hook_event_name: 'PreToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: target, old_string: '0', new_string: '1' },
  }, 8)), undefined);
  fs.writeFileSync(target, 'export const value = 1;\n');
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Edit',
    tool_input: { file_path: target, old_string: '0', new_string: '1' },
    tool_response: { success: true },
  }, 9);

  const blocked = hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Implemented and complete.',
  }, 10);

  assert.equal(blocked.decision, 'block');
  assert.match(blocked.reason, /review|verification/i);

  readReference(state, 'review', 11);
  readReference(state, 'verification', 12);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git diff --check' },
    tool_response: { exit_code: 0 },
  }, 13);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npm test' },
    tool_response: { exit_code: 0 },
  }, 14);
  readReference(state, 'memory', 15);
  readReference(state, 'reporting', 16);

  const unchecked = hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Verified result and Knowledge Delta.',
  }, 17);
  assert.equal(unchecked.decision, 'block');
  assert.match(unchecked.reason, /diff inspection/i);

  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git diff -- new-module.ts' },
    tool_response: { exit_code: 0, output: 'diff --git a/new-module.ts b/new-module.ts\n-0\n+1\n' },
  }, 18);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git status --short' },
    tool_response: { exit_code: 0, output: ' M new-module.ts\n' },
  }, 19);

  assert.deepEqual(hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Verified result and Knowledge Delta.',
  }, 20), {});
});

test('does not accept echoed reference, diff, or verification names as evidence', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const target = path.join(state.cwd, 'new-module.ts');
  fs.writeFileSync(target, 'export const value = 1;\n');
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Write',
    tool_input: { file_path: target, content: 'export const value = 1;\n' },
    tool_response: { success: true },
  }, 9);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: {
      command: 'echo skills/pave/references/review.md skills/pave/references/verification.md skills/pave/references/memory.md skills/pave/references/reporting.md && echo git diff && echo npm test',
    },
    tool_response: { exit_code: 0, output: 'names only\n' },
  }, 10);

  const output = hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 11);
  assert.equal(output.decision, 'block');
  assert.match(output.reason, /review|verification|diff/i);
});

test('requires an untracked file to be inspected after an empty git diff', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const target = path.join(state.cwd, 'new-module.ts');
  fs.writeFileSync(target, 'export const value = 1;\n');
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Write',
    tool_input: { file_path: target, content: 'export const value = 1;\n' },
    tool_response: { success: true },
  }, 9);
  readReference(state, 'review', 10);
  readReference(state, 'verification', 11);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git diff -- new-module.ts' },
    tool_response: { exit_code: 0, output: '' },
  }, 12);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npm test' },
    tool_response: { exit_code: 0, output: 'tests passed\n' },
  }, 13);
  readReference(state, 'memory', 14);
  readReference(state, 'reporting', 15);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git status --short' },
    tool_response: { exit_code: 0, output: '?? new-module.ts\n' },
  }, 16);

  const blocked = hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 17);
  assert.equal(blocked.decision, 'block');
  assert.match(blocked.reason, /inspect|diff/i);

  readFile(state, target, 18);
  assert.deepEqual(hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 19), {});
});

test('treats an apply_patch Add File as untracked review evidence', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const target = path.join(state.cwd, 'added-by-patch.ts');
  fs.writeFileSync(target, 'export const added = true;\n');
  const patch = [
    '*** Begin Patch',
    '*** Add File: added-by-patch.ts',
    '+export const added = true;',
    '*** End Patch',
  ].join('\n');
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'functions.apply_patch',
    tool_input: { patch },
    tool_response: { success: true },
  }, 9);
  readReference(state, 'review', 10);
  readReference(state, 'verification', 11);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'npm test' },
    tool_response: { exit_code: 0 },
  }, 12);
  readReference(state, 'memory', 13);
  readReference(state, 'reporting', 14);
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    tool_input: { command: 'git status --short' },
    tool_response: { exit_code: 0, output: '?? added-by-patch.ts\n' },
  }, 15);

  const blocked = hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 16);
  assert.equal(blocked.decision, 'block');
  assert.match(blocked.reason, /untracked files/);

  readFile(state, target, 17);
  assert.deepEqual(hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Complete.',
  }, 18), {});
});

test('allows an explicit blocked report without pretending verification completed', () => {
  const state = fixture();
  prepareApprovedFeature(state);
  const target = path.join(state.cwd, 'new-module.ts');
  fs.writeFileSync(target, 'export const value = 1;\n');
  hook(state, {
    hook_event_name: 'PostToolUse',
    tool_name: 'Write',
    tool_input: { file_path: target, content: 'export const value = 1;\n' },
    tool_response: { success: true },
  }, 8);

  assert.deepEqual(hook(state, {
    hook_event_name: 'Stop',
    last_assistant_message: 'Need user input.\n<!-- PAVE_BLOCKED -->',
  }, 9), {});
});

test('doctor canary proves the overwrite guard executes', () => {
  assert.equal(runSelfCheck(), true);
});
