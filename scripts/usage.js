#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SCHEMA_VERSION = 1;
const PHASE_PATTERN = /^\[PAVE:([a-z-]+)](?:\s|$)/;
const USAGE_VIEWS = new Set(['latest', 'daily', 'weekly', 'cumulative']);
const ZERO_USAGE = Object.freeze({
  inputTokens: 0,
  cachedInputTokens: 0,
  outputTokens: 0,
  reasoningOutputTokens: 0,
  totalTokens: 0,
});

function normalizeUsage(value) {
  if (!value || typeof value !== 'object') return null;
  const totalTokens = Number(value.total_tokens);
  if (!Number.isFinite(totalTokens)) return null;

  return {
    inputTokens: Number(value.input_tokens) || 0,
    cachedInputTokens: Number(value.cached_input_tokens) || 0,
    outputTokens: Number(value.output_tokens) || 0,
    reasoningOutputTokens: Number(value.reasoning_output_tokens) || 0,
    totalTokens,
  };
}

function readLatestUsage(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return null;

  const stat = fs.statSync(transcriptPath);
  const maxBytes = 4 * 1024 * 1024;
  const length = Math.min(stat.size, maxBytes);
  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(transcriptPath, 'r');
  try {
    fs.readSync(fd, buffer, 0, length, stat.size - length);
  } finally {
    fs.closeSync(fd);
  }

  const lines = buffer.toString('utf8').split('\n');
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (!lines[index].includes('"type":"token_count"')) continue;
    try {
      const event = JSON.parse(lines[index]);
      const usage = event?.payload?.info?.total_token_usage;
      const normalized = normalizeUsage(usage);
      if (normalized) return normalized;
    } catch {
      // The first line can be partial when only the transcript tail was read.
    }
  }
  return null;
}

function readFirstUsageAfterOffset(transcriptPath, offset) {
  if (!transcriptPath || !Number.isFinite(offset) || !fs.existsSync(transcriptPath)) {
    return null;
  }
  const stat = fs.statSync(transcriptPath);
  if (offset >= stat.size) return null;
  const length = Math.min(stat.size - offset, 4 * 1024 * 1024);
  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(transcriptPath, 'r');
  try {
    fs.readSync(fd, buffer, 0, length, offset);
  } finally {
    fs.closeSync(fd);
  }

  for (const line of buffer.toString('utf8').split('\n')) {
    if (!line.includes('"type":"token_count"')) continue;
    try {
      const event = JSON.parse(line);
      const normalized = normalizeUsage(event?.payload?.info?.total_token_usage);
      if (normalized) return normalized;
    } catch {
      // Ignore incomplete or unrelated transcript lines.
    }
  }
  return null;
}

function subtractUsage(end, start) {
  if (!end || !start) return null;
  const result = {};
  for (const key of [
    'inputTokens',
    'cachedInputTokens',
    'outputTokens',
    'reasoningOutputTokens',
    'totalTokens',
  ]) {
    const delta = end[key] - start[key];
    if (!Number.isFinite(delta) || delta < 0) return null;
    result[key] = delta;
  }
  return result;
}

function safeId(value) {
  return String(value || 'unknown').replace(/[^A-Za-z0-9_.-]/g, '_');
}

function statePath(dataDir, sessionId) {
  return path.join(dataDir, 'active', `${safeId(sessionId)}.json`);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tempPath, filePath);
}

function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function snapshot(input) {
  return readLatestUsage(input.transcript_path);
}

function transcriptSize(input) {
  try {
    return fs.statSync(input.transcript_path).size;
  } catch {
    return null;
  }
}

function startPending(input, now) {
  return {
    schemaVersion: SCHEMA_VERSION,
    runId: crypto.randomUUID(),
    state: 'pending',
    repo: path.basename(input.cwd || '') || 'unknown',
    model: input.model || 'unknown',
    startedAt: now,
    startUsage: snapshot(input) || { ...ZERO_USAGE },
    currentPhase: null,
    phases: [],
    pendingFinish: false,
  };
}

function getPavePlan(input) {
  if (input.tool_name !== 'update_plan') return null;
  const plan = input.tool_input?.plan;
  if (!Array.isArray(plan)) return null;

  const phases = plan.flatMap((item) => {
    const match = PHASE_PATTERN.exec(String(item.step || ''));
    return match ? [{ name: match[1], status: item.status }] : [];
  });
  return phases.length > 0 ? phases : null;
}

function isInProgress(status) {
  return status === 'in_progress' || status === 'inProgress';
}

function closeCurrentPhase(state, now, endOffset) {
  if (!state.currentPhase) return;
  state.currentPhase.endedAt = now;
  state.currentPhase.durationMs = Math.max(0, now - state.currentPhase.startedAt);
  state.currentPhase.endOffset = endOffset;
  state.phases.push(state.currentPhase);
  state.currentPhase = null;
}

function transitionPhase(state, phaseName, now, endOffset) {
  if (state.currentPhase?.name === phaseName) return;
  closeCurrentPhase(state, now, endOffset);
  state.currentPhase = {
    name: phaseName,
    startedAt: state.phases.length === 0 ? state.startedAt : now,
  };
}

function finalizeRun(dataDir, stateFile, state, status, now, input) {
  const finalUsage = snapshot(input);
  closeCurrentPhase(state, now, null);
  let phaseStartUsage = state.startUsage;
  const phases = state.phases.map((phase, index) => {
    const isLast = index === state.phases.length - 1;
    const phaseEndUsage = isLast && phase.endOffset === null
      ? finalUsage
      : readFirstUsageAfterOffset(input.transcript_path, phase.endOffset);
    const completedPhase = {
      name: phase.name,
      startedAt: phase.startedAt,
      endedAt: phase.endedAt,
      durationMs: phase.durationMs,
      usage: subtractUsage(phaseEndUsage, phaseStartUsage),
    };
    phaseStartUsage = phaseEndUsage;
    return completedPhase;
  });
  const completed = {
    schemaVersion: SCHEMA_VERSION,
    runId: state.runId,
    status,
    repo: state.repo,
    model: state.model,
    startedAt: state.startedAt,
    endedAt: now,
    durationMs: Math.max(0, now - state.startedAt),
    usage: subtractUsage(finalUsage, state.startUsage),
    phases,
  };
  const runPath = path.join(dataDir, 'runs', `${now}-${safeId(state.runId)}.json`);
  writeJson(runPath, completed);
  removeFile(stateFile);
}

function usageViewFromPrompt(prompt) {
  const text = String(prompt || '');
  if (!/(?:\$pave:usage|\/pave:usage)/i.test(text)) return null;
  const match = text.match(/\b(latest|daily|weekly|cumulative)\b/i);
  return match ? match[1].toLowerCase() : 'latest';
}

function handleHook(input, options = {}) {
  const dataDir = options.dataDir || process.env.PLUGIN_DATA
    || path.join(os.homedir(), '.codex', 'plugins', 'data', 'pave-pave');
  const now = (options.now || Date.now)();
  const sessionId = input.session_id || 'unknown';
  const activePath = statePath(dataDir, sessionId);
  let state = readJson(activePath);

  if (input.hook_event_name === 'UserPromptSubmit') {
    const view = usageViewFromPrompt(input.prompt);
    if (view) {
      return {
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: `PAVE_USAGE_REPORT\n${renderUsage(dataDir, view, now)}`,
        },
      };
    }
    if (!state || state.state === 'pending') {
      writeJson(activePath, startPending(input, now));
    }
    return {};
  }

  if (input.hook_event_name === 'PostToolUse') {
    const pavePlan = getPavePlan(input);
    if (!pavePlan) return {};
    if (!state) state = startPending(input, now);
    state.state = 'active';
    state.model = input.model || state.model;
    const inProgress = pavePlan.find((phase) => isInProgress(phase.status));
    if (inProgress) {
      state.pendingFinish = false;
      transitionPhase(state, inProgress.name, now, transcriptSize(input));
    } else if (pavePlan.every((phase) => phase.status === 'completed')) {
      state.pendingFinish = true;
    }
    writeJson(activePath, state);
    return {};
  }

  if (input.hook_event_name === 'Stop') {
    if (!state) return {};
    if (state.state === 'pending') {
      removeFile(activePath);
    } else if (state.pendingFinish) {
      finalizeRun(dataDir, activePath, state, 'completed', now, input);
    }
    return {};
  }

  if (input.hook_event_name === 'SessionEnd') {
    if (!state) return {};
    if (state.state === 'pending') {
      removeFile(activePath);
    } else {
      finalizeRun(dataDir, activePath, state, 'abandoned', now, input);
    }
  }
  return {};
}

function listRuns(dataDir) {
  const runsDir = path.join(dataDir, 'runs');
  if (!fs.existsSync(runsDir)) return [];
  return fs.readdirSync(runsDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => readJson(path.join(runsDir, name)))
    .filter(Boolean)
    .sort((a, b) => b.endedAt - a.endedAt);
}

function formatDuration(durationMs) {
  const seconds = Math.max(0, Math.round(durationMs / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${remaining}s`;
  if (minutes > 0) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function formatTokens(usage) {
  return usage ? `${usage.totalTokens.toLocaleString('en-US')} tokens` : 'unavailable';
}

function sumUsage(items) {
  if (items.some((item) => !item)) return null;
  return items.reduce((total, item) => {
    for (const key of Object.keys(total)) total[key] += item[key];
    return total;
  }, {
    inputTokens: 0,
    cachedInputTokens: 0,
    outputTokens: 0,
    reasoningOutputTokens: 0,
    totalTokens: 0,
  });
}

function selectRuns(runs, view, now) {
  if (view === 'latest') return runs.slice(0, 1);
  if (view === 'cumulative') return runs;
  const date = new Date(now);
  const cutoff = view === 'daily'
    ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    : now - (7 * 24 * 60 * 60 * 1000);
  return runs.filter((run) => run.endedAt >= cutoff);
}

function renderUsage(dataDir, requestedView = 'latest', now = Date.now()) {
  const view = USAGE_VIEWS.has(requestedView) ? requestedView : 'latest';
  const runs = selectRuns(listRuns(dataDir), view, now);
  if (runs.length === 0) return `PAVE Usage - ${view}\n\nNo completed PAVE runs.`;

  const totalDuration = runs.reduce((sum, run) => sum + run.durationMs, 0);
  const totalUsage = sumUsage(runs.map((run) => run.usage));
  const phaseMap = new Map();
  for (const run of runs) {
    for (const phase of run.phases) {
      const current = phaseMap.get(phase.name) || { durationMs: 0, usage: [] };
      current.durationMs += phase.durationMs;
      current.usage.push(phase.usage);
      phaseMap.set(phase.name, current);
    }
  }

  const lines = [
    `PAVE Usage - ${view}`,
    '',
    `Runs: ${runs.length}`,
    `Repository: ${runs.length === 1 ? runs[0].repo : 'multiple'}`,
    `Elapsed: ${formatDuration(totalDuration)}`,
    `Tokens: ${formatTokens(totalUsage)}`,
    '',
    '| Phase | Time | Tokens |',
    '| --- | ---: | ---: |',
  ];
  for (const [name, phase] of phaseMap) {
    lines.push(`| ${name} | ${formatDuration(phase.durationMs)} | ${formatTokens(sumUsage(phase.usage))} |`);
  }
  return lines.join('\n');
}

function resolveDataDir() {
  if (process.env.PAVE_USAGE_DATA_DIR) return process.env.PAVE_USAGE_DATA_DIR;
  if (process.env.PLUGIN_DATA) return process.env.PLUGIN_DATA;
  const pluginsData = path.join(os.homedir(), '.codex', 'plugins', 'data');
  if (fs.existsSync(pluginsData)) {
    const candidates = fs.readdirSync(pluginsData, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /(^|-)pave$/.test(entry.name))
      .map((entry) => path.join(pluginsData, entry.name))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    if (candidates.length > 0) return candidates[0];
  }
  return path.join(pluginsData, 'pave-pave');
}

function readStdin() {
  return fs.readFileSync(0, 'utf8');
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0] || 'hook';
  if (command === 'report') {
    console.log(renderUsage(resolveDataDir(), argv[1] || 'latest'));
    return;
  }

  try {
    const input = JSON.parse(readStdin());
    process.stdout.write(`${JSON.stringify(handleHook(input))}\n`);
  } catch (error) {
    process.stderr.write(`PAVE usage hook skipped: ${error.message}\n`);
    process.stdout.write('{}\n');
  }
}

if (require.main === module) main();

module.exports = {
  handleHook,
  readFirstUsageAfterOffset,
  readLatestUsage,
  renderUsage,
  subtractUsage,
};
