const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  handleHook,
  readLatestUsage,
  renderUsage,
} = require('../scripts/usage');

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-usage-test-'));
  return {
    dataDir: path.join(root, 'data'),
    transcript: path.join(root, 'rollout.jsonl'),
  };
}

function writeUsage(filePath, totalTokens, timestamp = '2026-08-03T00:00:00.000Z') {
  const usage = {
    input_tokens: totalTokens - 20,
    cached_input_tokens: 10,
    output_tokens: 15,
    reasoning_output_tokens: 5,
    total_tokens: totalTokens,
  };
  fs.appendFileSync(filePath, `${JSON.stringify({
    timestamp,
    type: 'event_msg',
    payload: {
      type: 'token_count',
      info: { total_token_usage: usage },
    },
  })}\n`);
}

function hook(fixture, input, now) {
  return handleHook(input, {
    dataDir: fixture.dataDir,
    now: () => now,
  });
}

function planInput(fixture, phase, status = 'in_progress') {
  return {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'PostToolUse',
    model: 'gpt-test',
    tool_name: 'update_plan',
    tool_input: {
      plan: [
        { step: `[PAVE:${phase}] ${phase}`, status },
      ],
    },
  };
}

test('reads the latest cumulative token usage from a Codex transcript', () => {
  const fixture = makeFixture();
  writeUsage(fixture.transcript, 100);
  writeUsage(fixture.transcript, 175);

  assert.deepEqual(readLatestUsage(fixture.transcript), {
    inputTokens: 155,
    cachedInputTokens: 10,
    outputTokens: 15,
    reasoningOutputTokens: 5,
    totalTokens: 175,
  });
});

test('records PAVE phase duration and token deltas through the final response', () => {
  const fixture = makeFixture();
  writeUsage(fixture.transcript, 100);

  hook(fixture, {
    session_id: 'thread-1',
    turn_id: 'turn-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-test',
    prompt: 'private implementation request',
  }, 1_000);

  const pending = fs.readFileSync(
    path.join(fixture.dataDir, 'active', 'thread-1.json'),
    'utf8',
  );
  assert.doesNotMatch(pending, /private implementation request/);

  hook(fixture, planInput(fixture, 'inspect'), 2_000);
  writeUsage(fixture.transcript, 150);

  hook(fixture, planInput(fixture, 'execute'), 5_000);
  writeUsage(fixture.transcript, 220);

  hook(fixture, planInput(fixture, 'report'), 8_000);
  writeUsage(fixture.transcript, 300);

  hook(fixture, planInput(fixture, 'report', 'completed'), 9_000);
  writeUsage(fixture.transcript, 330);

  assert.equal(
    fs.existsSync(path.join(fixture.dataDir, 'active', 'thread-1.json')),
    true,
    'the run remains active until Stop captures final response usage',
  );

  writeUsage(fixture.transcript, 350);
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'Stop',
    model: 'gpt-test',
  }, 10_000);

  const runFiles = fs.readdirSync(path.join(fixture.dataDir, 'runs'));
  assert.equal(runFiles.length, 1);
  const run = JSON.parse(fs.readFileSync(
    path.join(fixture.dataDir, 'runs', runFiles[0]),
    'utf8',
  ));

  assert.equal(run.status, 'completed');
  assert.equal(run.repo, 'example-project');
  assert.equal(run.durationMs, 9_000);
  assert.equal(run.usage.totalTokens, 250);
  assert.deepEqual(
    run.phases.map((phase) => [
      phase.name,
      phase.durationMs,
      phase.usage.totalTokens,
    ]),
    [
      ['inspect', 4_000, 120],
      ['execute', 3_000, 80],
      ['report', 2_000, 50],
    ],
  );
});

test('keeps an approval wait open across Stop events', () => {
  const fixture = makeFixture();
  writeUsage(fixture.transcript, 40);
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-test',
    prompt: 'start',
  }, 1_000);
  hook(fixture, planInput(fixture, 'approval'), 2_000);

  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    hook_event_name: 'Stop',
  }, 5_000);

  assert.equal(
    fs.existsSync(path.join(fixture.dataDir, 'active', 'thread-1.json')),
    true,
  );
  assert.equal(fs.existsSync(path.join(fixture.dataDir, 'runs')), false);
});

test('replaces stale unpromoted prompt state before a later PAVE run', () => {
  const fixture = makeFixture();
  writeUsage(fixture.transcript, 10);
  const promptInput = {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-test',
    prompt: 'ordinary prompt',
  };
  hook(fixture, promptInput, 1_000);
  writeUsage(fixture.transcript, 20);
  hook(fixture, promptInput, 2_000);
  hook(fixture, planInput(fixture, 'report'), 3_000);
  writeUsage(fixture.transcript, 40);
  hook(fixture, planInput(fixture, 'report', 'completed'), 4_000);
  writeUsage(fixture.transcript, 50);
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    hook_event_name: 'Stop',
  }, 5_000);

  const runFile = fs.readdirSync(path.join(fixture.dataDir, 'runs'))[0];
  const run = JSON.parse(fs.readFileSync(
    path.join(fixture.dataDir, 'runs', runFile),
    'utf8',
  ));
  assert.equal(run.startedAt, 2_000);
  assert.equal(run.usage.totalTokens, 30);
});

test('uses zero as the exact baseline for the first run in a new transcript', () => {
  const fixture = makeFixture();
  fs.writeFileSync(fixture.transcript, '');
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-test',
    prompt: 'start',
  }, 1_000);

  hook(fixture, planInput(fixture, 'report'), 2_000);
  writeUsage(fixture.transcript, 60);
  hook(fixture, planInput(fixture, 'report', 'completed'), 3_000);
  writeUsage(fixture.transcript, 100);
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    hook_event_name: 'Stop',
  }, 4_000);

  const runFile = fs.readdirSync(path.join(fixture.dataDir, 'runs'))[0];
  const run = JSON.parse(fs.readFileSync(
    path.join(fixture.dataDir, 'runs', runFile),
    'utf8',
  ));
  assert.equal(run.usage.totalTokens, 100);
});

test('filters daily and weekly aggregate views by completion time', () => {
  const fixture = makeFixture();
  const runsDir = path.join(fixture.dataDir, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });
  const now = new Date(2026, 7, 3, 12).getTime();
  const usage = {
    inputTokens: 5,
    cachedInputTokens: 0,
    outputTokens: 5,
    reasoningOutputTokens: 0,
    totalTokens: 10,
  };
  for (const [name, endedAt] of [
    ['today', now - 60_000],
    ['week', now - (2 * 24 * 60 * 60 * 1000)],
    ['old', now - (10 * 24 * 60 * 60 * 1000)],
  ]) {
    fs.writeFileSync(path.join(runsDir, `${name}.json`), JSON.stringify({
      status: 'completed',
      repo: name,
      model: 'gpt-test',
      startedAt: endedAt - 1_000,
      endedAt,
      durationMs: 1_000,
      usage,
      phases: [],
    }));
  }

  assert.match(renderUsage(fixture.dataDir, 'daily', now), /Runs: 1/);
  assert.match(renderUsage(fixture.dataDir, 'weekly', now), /Runs: 2/);
  assert.match(renderUsage(fixture.dataDir, 'cumulative', now), /Runs: 3/);
});

test('injects an explicit PAVE usage request without starting a measured run', () => {
  const fixture = makeFixture();
  const output = hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-test',
    prompt: '$pave:usage weekly',
  }, 1_000);

  assert.match(
    output.hookSpecificOutput.additionalContext,
    /PAVE_USAGE_REPORT\nPAVE Usage - weekly/,
  );
  assert.equal(fs.existsSync(path.join(fixture.dataDir, 'active')), false);
});

test('renders latest usage without exposing transcript or prompt data', () => {
  const fixture = makeFixture();
  writeUsage(fixture.transcript, 10);
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    cwd: '/workspace/example-project',
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-test',
    prompt: 'secret prompt contents',
  }, 1_000);
  writeUsage(fixture.transcript, 35);
  hook(fixture, planInput(fixture, 'report'), 2_000);
  writeUsage(fixture.transcript, 40);
  hook(fixture, planInput(fixture, 'report', 'completed'), 3_000);
  writeUsage(fixture.transcript, 50);
  hook(fixture, {
    session_id: 'thread-1',
    transcript_path: fixture.transcript,
    hook_event_name: 'Stop',
  }, 4_000);

  const report = renderUsage(fixture.dataDir, 'latest', 5_000);
  assert.match(report, /PAVE Usage - latest/);
  assert.match(report, /example-project/);
  assert.match(report, /40 tokens/);
  assert.doesNotMatch(report, /secret prompt|rollout\.jsonl|\/workspace\//);
});
