#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const STATE_VERSION = 1;
const APPROVAL_READY = '<!-- PAVE_APPROVAL_READY -->';
const DECISIONS_RESOLVED = '<!-- PAVE_DECISIONS_RESOLVED -->';
const AWAITING_DECISION = '<!-- PAVE_AWAITING_DECISION -->';
const BLOCKED_REPORT = '<!-- PAVE_BLOCKED -->';
const APPROVAL_PHRASES = new Set([
  '진행해', '진행해줘', '시작해', '시작해줘', '구현해', '구현해줘', '승인', '승인해', '승인합니다',
  'approve', 'approved', 'proceed', 'go ahead', 'start', 'implement',
]);

const STANDARD_REFERENCES = {
  feature: ['context-retrieval', 'design', 'testing', 'planning', 'execution-loop'],
  bug: ['context-retrieval', 'request-routing', 'debugging', 'testing', 'memory', 'execution-loop'],
  fast: ['context-retrieval', 'fast-path', 'testing', 'verification'],
};

const UI_EXTENSIONS = new Set([
  '.css', '.html', '.jsx', '.less', '.scss', '.svelte', '.tsx', '.vue',
]);

function defaultDataDir() {
  const base = process.env.CLAUDE_PLUGIN_DATA || process.env.PLUGIN_DATA
    || path.join(os.tmpdir(), 'pave-plugin-data');
  return path.join(base, 'workflow-guard');
}

function sessionKey(input) {
  const identity = String(input.session_id || input.sessionId || 'default');
  return crypto.createHash('sha256').update(identity).digest('hex');
}

function statePath(input, dataDir) {
  return path.join(dataDir, 'active', `${sessionKey(input)}.json`);
}

function readState(input, dataDir) {
  try {
    return JSON.parse(fs.readFileSync(statePath(input, dataDir), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function writeState(input, dataDir, state) {
  const file = statePath(input, dataDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(state)}\n`, { mode: 0o600 });
  fs.renameSync(temporary, file);
}

function removeState(input, dataDir) {
  try {
    fs.unlinkSync(statePath(input, dataDir));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

function isPaveInvocation(prompt) {
  return /(?:^|\s)(?:\$pave:pave|\/pave(?::pave)?)(?=\s|$)/i.test(String(prompt || ''));
}

function isPaveExpansion(input) {
  return /^(?:pave:)?pave$/i.test(String(input.command_name || input.commandName || ''));
}

function isPaveSkillInvocation(input) {
  if (toolName(input) !== 'Skill') return false;
  const details = toolInput(input);
  return /^(?:pave:)?pave$/i.test(String(details.skill || details.name || ''));
}

function isApproval(prompt) {
  const normalized = String(prompt || '').trim().toLowerCase().replace(/[.!]+$/, '').trim();
  return APPROVAL_PHRASES.has(normalized);
}

function toolName(input) {
  const raw = String(input.tool_name || input.toolName || '').split('.').pop();
  if (raw === 'exec_command') return 'Bash';
  if (raw === 'apply_patch') return 'ApplyPatch';
  return raw;
}

function toolInput(input) {
  const value = input.tool_input || input.toolInput || {};
  return typeof value === 'string' ? { input: value } : value;
}

function commandText(details) {
  return String(details.command || details.cmd || '');
}

function patchText(details) {
  return String(details.patch || details.input || '');
}

function now(options) {
  return typeof options.now === 'function' ? options.now() : Date.now();
}

function initialState(input, timestamp) {
  return {
    schemaVersion: STATE_VERSION,
    active: true,
    cwd: path.resolve(input.cwd || process.cwd()),
    references: {},
    awaitingApproval: false,
    approved: false,
    editedAt: null,
    changedFiles: [],
    substantiveLines: 0,
    diffInspectedAt: null,
    statusInspectedAt: null,
    inspectedFiles: {},
    untrackedFiles: [],
    verifiedAt: null,
    activatedAt: timestamp,
  };
}

function route(state) {
  if (state.references.debugging) return 'bug';
  if (state.references.design) return 'feature';
  if (state.references['fast-path']) return 'fast';
  return 'unknown';
}

function missingReferences(state, names) {
  return names.filter((name) => !state.references[name]);
}

function referenceName(filePath, pluginRoot) {
  if (!filePath) return null;
  const referencesRoot = path.join(pluginRoot, 'skills', 'pave', 'references');
  const absolute = path.resolve(String(filePath));
  if (path.dirname(absolute) !== referencesRoot) return null;
  const match = path.basename(absolute).match(/^([a-z0-9-]+)\.md$/);
  return match ? match[1] : null;
}

function referencesInCommand(command) {
  const names = [];
  for (const segment of commandSegments(command)) {
    if (!/^\s*(?:cat|head|tail|less|sed\s+-n)\b/.test(segment)) continue;
    const matcher = /references\/([a-z0-9-]+)\.md\b/g;
    for (const match of segment.matchAll(matcher)) names.push(match[1]);
  }
  return names;
}

function commandSegments(command) {
  return String(command || '').split(/&&|;|\||\n/).map((part) => part.trim()).filter(Boolean);
}

function responseText(input) {
  const response = input.tool_response || input.toolResponse || {};
  const content = Array.isArray(response.content)
    ? response.content.map((item) => item?.text || '').join('\n')
    : response.content;
  return String(response.output || response.stdout || content || '');
}

function isActualGitCommand(command, subcommand) {
  return commandSegments(command).some((part) => new RegExp(`^git\\s+${subcommand}\\b`).test(part));
}

function recordStatusPaths(state, output) {
  for (const line of String(output || '').split('\n')) {
    const match = line.match(/^\?\?\s+(.+)$/);
    if (!match || match[1].startsWith('"')) continue;
    const filePath = path.resolve(state.cwd, match[1]);
    if (!isWithin(state.cwd, filePath)) continue;
    if (!state.changedFiles.includes(filePath)) state.changedFiles.push(filePath);
    state.untrackedFiles ||= [];
    if (!state.untrackedFiles.includes(filePath)) state.untrackedFiles.push(filePath);
  }
}

function isReadOnlyBash(command) {
  const text = String(command || '');
  if (!text.trim()) return true;
  if (/(?:^|[^<])>{1,2}|<\(|`|\$\(|\|\||\bfind\b[^\n]*(?:-delete|-exec|-execdir)\b|\brg\b[^\n]*--pre\b|\bsed\b[^\n]*\s-i(?:\s|$)/m.test(text)) return false;

  return commandSegments(text).every((part) => (
    /^(?:pwd|ls|rg|grep|cat|head|tail|less|wc|stat|file|readlink|realpath|test)\b/.test(part)
    || /^sed\s+-n\b/.test(part)
    || (/^find\b/.test(part) && !/(?:-delete|-exec|-execdir)\b/.test(part))
    || /^git\s+(?:status|diff|log|show|branch|rev-parse|ls-files|grep|check-ignore|remote)\b/.test(part)
    || /^node\s+--check\b/.test(part)
    || /^bash\s+-n\b/.test(part)
    || /^claude\s+plugin\s+validate\b/.test(part)
    || isVerificationCommand(part)
  ));
}

function isSuccessful(input) {
  const response = input.tool_response || input.toolResponse || {};
  if (response.success === false || response.is_error === true || response.error) return false;
  if (typeof response.exit_code === 'number') return response.exit_code === 0;
  return true;
}

function isWithin(root, candidate) {
  if (!candidate) return false;
  const relative = path.relative(root, path.resolve(root, String(candidate)));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function targetPath(state, input) {
  const candidate = toolInput(input).file_path || toolInput(input).path;
  if (!candidate) return null;
  return path.resolve(state.cwd, String(candidate));
}

function editTargets(state, input) {
  if (toolName(input) !== 'ApplyPatch') {
    const target = targetPath(state, input);
    return target ? [target] : [];
  }

  const targets = [];
  const matcher = /^\*\*\* (?:Add|Delete|Update) File: (.+)$/gm;
  for (const match of patchText(toolInput(input)).matchAll(matcher)) {
    targets.push(path.resolve(state.cwd, match[1].trim()));
  }
  return [...new Set(targets)];
}

function addedTargets(state, input) {
  if (toolName(input) === 'Write') return editTargets(state, input);
  if (toolName(input) !== 'ApplyPatch') return [];
  const targets = [];
  const matcher = /^\*\*\* Add File: (.+)$/gm;
  for (const match of patchText(toolInput(input)).matchAll(matcher)) {
    targets.push(path.resolve(state.cwd, match[1].trim()));
  }
  return [...new Set(targets)];
}

function isUiPath(filePath) {
  if (!filePath) return false;
  return UI_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function shellOverwrite(command) {
  const text = String(command || '');
  return /\b(?:cat|printf|echo)\b[^\n]*(?:^|[^<])>{1,2}\s*[^&|\s]/m.test(text)
    || /(?:^|[;&|]\s*|\n)\s*tee(?:\s+-a)?\s+[^|\s]/m.test(text)
    || /\bsed\b[^\n]*\s-i(?:\s|$)/m.test(text);
}

function deny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
}

function block(reason) {
  return { decision: 'block', reason };
}

function lineCount(value) {
  return String(value || '').split('\n').filter((line) => line.trim()).length;
}

function predictedFastChange(state, input, filePath) {
  const files = new Set(state.changedFiles);
  if (filePath) files.add(filePath);
  const details = toolInput(input);
  let added;
  if (toolName(input) === 'Write') added = lineCount(details.content);
  else if (toolName(input) === 'ApplyPatch') {
    added = patchText(details).split('\n').filter((line) => /^[+-](?![+-])/.test(line) && line.slice(1).trim()).length;
  } else added = Math.max(lineCount(details.old_string), lineCount(details.new_string));
  return { files: files.size, lines: state.substantiveLines + added };
}

function preToolUse(input, state) {
  const name = toolName(input);
  const details = toolInput(input);

  if (name === 'Bash' && shellOverwrite(commandText(details))) {
    return deny('PAVE blocks shell redirection and in-place shell writes. Use Edit for an existing file or Write for a confirmed-new file.');
  }

  if (name === 'Bash' && !isReadOnlyBash(commandText(details))) {
    const selectedRoute = route(state);
    if (selectedRoute === 'fast') {
      return deny('PAVE fast path blocks shell commands that may mutate files because its file and line limits cannot be verified. Use Edit or Write.');
    }
    if (selectedRoute === 'unknown') {
      return deny('PAVE reference routing is incomplete. Load and apply the required route references before running a mutating shell command.');
    }
    const missing = missingReferences(state, STANDARD_REFERENCES[selectedRoute]);
    if (missing.length > 0) {
      return deny(`PAVE required reference evidence is missing: ${missing.join(', ')}.`);
    }
    if (!state.approved) {
      return deny('PAVE implementation approval has not been recorded for this mutating shell command.');
    }
  }

  if (name !== 'Write' && name !== 'Edit' && name !== 'ApplyPatch') return {};

  const filePaths = editTargets(state, input).filter((filePath) => isWithin(state.cwd, filePath));
  if (filePaths.length === 0) return {};

  if (name === 'Write' && filePaths.some((filePath) => fs.existsSync(filePath))) {
    return deny('PAVE blocks Write on an existing file because it can erase uninspected behavior. Inspect the file and use Edit.');
  }

  const selectedRoute = route(state);
  if (selectedRoute === 'unknown') {
    return deny('PAVE reference routing is incomplete. Load and apply the required route references before editing.');
  }

  const missing = missingReferences(state, STANDARD_REFERENCES[selectedRoute]);
  if (missing.length > 0) {
    return deny(`PAVE required reference evidence is missing: ${missing.join(', ')}.`);
  }

  if (selectedRoute !== 'fast' && !state.approved) {
    return deny('PAVE implementation approval has not been recorded for the surfaced boundary and resolved decisions.');
  }

  if (filePaths.some(isUiPath) && !state.references['design-system']) {
    return deny('PAVE requires design-system.md evidence before a user-visible edit.');
  }

  if (selectedRoute === 'fast') {
    if (filePaths.some((filePath) => /(?:^|\/)(?:middleware|migrations?|schema|auth|security|permissions?)(?:[./_-]|$)/i.test(filePath))) {
      return deny('PAVE fast path does not allow middleware, schema, auth, security, or permission changes. Use the standard workflow.');
    }
    const predicted = predictedFastChange(state, input, filePaths[0]);
    predicted.files = new Set([...state.changedFiles, ...filePaths]).size;
    if (predicted.files > 2 || predicted.lines > 20) {
      return deny('PAVE fast path is limited to two hand-edited files and twenty substantive hand-edited lines. Use the standard workflow.');
    }
  }

  return {};
}

function recordPostToolUse(input, state, options) {
  if (!isSuccessful(input)) return;
  const timestamp = now(options);
  const name = toolName(input);
  const details = toolInput(input);

  if (name === 'Read') {
    const readPath = details.file_path || details.path;
    const reference = referenceName(readPath, options.pluginRoot);
    if (reference) state.references[reference] = timestamp;
    const absolute = readPath ? path.resolve(state.cwd, String(readPath)) : null;
    if (absolute && state.editedAt && state.changedFiles.includes(absolute)) {
      state.inspectedFiles ||= {};
      state.inspectedFiles[absolute] = timestamp;
    }
  }

  if (name === 'Bash') {
    const command = commandText(details);
    const output = responseText(input);
    if (output.trim()) {
      for (const reference of referencesInCommand(command)) {
        state.references[reference] = timestamp;
      }
    }
    const inspectedDiff = isActualGitCommand(command, 'diff')
      && !commandSegments(command).some((part) => /^git\s+diff\b.*--check\b/.test(part));
    if (inspectedDiff && output.trim()) state.diffInspectedAt = timestamp;
    if (isActualGitCommand(command, 'status') && output.trim()) {
      state.statusInspectedAt = timestamp;
      recordStatusPaths(state, output);
    }
    if (isVerificationCommand(command)) state.verifiedAt = timestamp;
    if (!isReadOnlyBash(command)) {
      state.editedAt = timestamp;
      state.shellMutation = true;
    }
  }

  if (name === 'Write' || name === 'Edit' || name === 'ApplyPatch') {
    const filePaths = editTargets(state, input).filter((filePath) => isWithin(state.cwd, filePath));
    if (filePaths.length === 0) return;
    state.editedAt = timestamp;
    for (const filePath of filePaths) {
      if (!state.changedFiles.includes(filePath)) state.changedFiles.push(filePath);
    }
    const addedFiles = addedTargets(state, input).filter((filePath) => isWithin(state.cwd, filePath));
    if (addedFiles.length > 0) {
      state.untrackedFiles ||= [];
      for (const filePath of addedFiles) {
        if (!state.untrackedFiles.includes(filePath)) state.untrackedFiles.push(filePath);
      }
    }
    if (name === 'Write') {
      state.substantiveLines += lineCount(details.content);
    }
    else if (name === 'ApplyPatch') {
      state.substantiveLines += patchText(details).split('\n')
        .filter((line) => /^[+-](?![+-])/.test(line) && line.slice(1).trim()).length;
    } else {
      state.substantiveLines += Math.max(lineCount(details.old_string), lineCount(details.new_string));
    }
  }
}

function isVerificationCommand(command) {
  const text = String(command || '');
  if (/\|\|\s*(?:true|:)/.test(text)) return false;
  return commandSegments(text).some((part) => (
    /^(?:npm|pnpm|yarn|bun)\s+(?:(?:run|exec)\s+)?(?:test|check|lint|build|typecheck)\b/i.test(part)
    || /^npx\s+(?:vitest|jest|tsc|eslint)\b/i.test(part)
    || /^(?:pytest|cargo\s+test|go\s+test|mvn\s+test|gradle\s+test)\b/i.test(part)
  ));
}

function handleStop(input, state, options) {
  const message = String(input.last_assistant_message || input.lastAssistantMessage || '');
  const timestamp = now(options);

  if (state.editedAt) {
    if (message.includes(BLOCKED_REPORT)) return { output: {}, remove: false };

    const missing = [];
    if (!(state.references.review >= state.editedAt)) missing.push('post-edit review.md');
    if (!(state.references.verification >= state.editedAt)) missing.push('post-edit verification.md');
    if (!(state.statusInspectedAt >= state.editedAt)) missing.push('successful git status inspection');
    const untracked = new Set(state.untrackedFiles || []);
    const trackedChanges = state.changedFiles.some((filePath) => !untracked.has(filePath))
      || (state.shellMutation && state.changedFiles.length === 0);
    if (trackedChanges && !(state.diffInspectedAt >= state.editedAt)) missing.push('successful non-empty git diff inspection');
    const uninspected = [...untracked].filter((filePath) => !((state.inspectedFiles || {})[filePath] >= state.editedAt));
    if (uninspected.length > 0) missing.push('post-edit inspection of untracked files');
    if (!(state.verifiedAt >= state.editedAt)) missing.push('successful verification command');
    if (!(state.references.memory >= state.verifiedAt)) missing.push('post-verification memory.md evaluation');
    if (!(state.references.reporting >= state.editedAt)) missing.push('reporting.md');

    if (missing.length > 0) {
      return { output: block(`PAVE cannot claim completion yet. Missing: ${missing.join(', ')}.`), remove: false };
    }
    return { output: {}, remove: true };
  }

  if (message.includes(AWAITING_DECISION) || message.includes(BLOCKED_REPORT)
    || (message.includes(APPROVAL_READY) && !message.includes(DECISIONS_RESOLVED))) {
    return { output: {}, remove: false };
  }

  const ready = message.includes(DECISIONS_RESOLVED) && message.includes(APPROVAL_READY);
  if (!ready) return { output: {}, remove: true };

  const selectedRoute = route(state);
  if (selectedRoute !== 'feature' && selectedRoute !== 'bug') {
    return { output: block('PAVE cannot request standard implementation approval until the request route and required references are established.'), remove: false };
  }

  const preApproval = STANDARD_REFERENCES[selectedRoute].filter((name) => name !== 'execution-loop');
  const missing = missingReferences(state, preApproval);
  if (missing.length > 0) {
    return { output: block(`PAVE cannot request approval yet. Missing reference evidence: ${missing.join(', ')}.`), remove: false };
  }

  state.awaitingApproval = true;
  state.approvalRequestedAt = timestamp;
  return { output: {}, remove: false };
}

function handleHook(input, providedOptions = {}) {
  const options = {
    dataDir: providedOptions.dataDir || defaultDataDir(),
    pluginRoot: path.resolve(providedOptions.pluginRoot || __dirname, providedOptions.pluginRoot ? '.' : '..'),
    now: providedOptions.now,
  };
  const event = input.hook_event_name || input.hookEventName;
  let state = readState(input, options.dataDir);

  if (event === 'UserPromptSubmit') {
    if (isPaveInvocation(input.prompt)) state = initialState(input, now(options));
    if (state && state.awaitingApproval && isApproval(input.prompt)) {
      state.approved = true;
      state.awaitingApproval = false;
      state.approvedAt = now(options);
    }
    if (state) writeState(input, options.dataDir, state);
    return {};
  }

  if (event === 'UserPromptExpansion' && isPaveExpansion(input)) {
    state = initialState(input, now(options));
    writeState(input, options.dataDir, state);
    return {};
  }

  if (event === 'PreToolUse' && isPaveSkillInvocation(input)) {
    state = initialState(input, now(options));
    writeState(input, options.dataDir, state);
    return {};
  }

  if (!state) return {};

  if (event === 'PreToolUse') return preToolUse(input, state);

  if (event === 'PostToolUse') {
    recordPostToolUse(input, state, options);
    writeState(input, options.dataDir, state);
    return {};
  }

  if (event === 'Stop') {
    const result = handleStop(input, state, options);
    if (result.remove) removeState(input, options.dataDir);
    else writeState(input, options.dataDir, state);
    return result.output;
  }

  if (event === 'SessionEnd') {
    removeState(input, options.dataDir);
    return {};
  }

  return {};
}

function runSelfCheck() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-guard-canary-'));
  try {
    const cwd = path.join(root, 'repo');
    const target = path.join(cwd, 'middleware.ts');
    fs.mkdirSync(cwd);
    fs.writeFileSync(target, 'preserve me\n');
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'hooks', 'hooks.json'), 'utf8'));
    const requiredEvents = ['UserPromptSubmit', 'UserPromptExpansion', 'PreToolUse', 'Stop'];
    const commands = Object.fromEntries(requiredEvents.map((event) => {
      const handlers = (manifest.hooks?.[event] || []).flatMap((entry) => entry.hooks || []);
      const handler = handlers.find((entry) => /scripts\/workflow-guard\.js/.test(entry.command || ''));
      if (!handler) throw new Error(`workflow guard hook is not registered for ${event}`);
      return [event, handler.command];
    }));
    const environment = {
      ...process.env,
      CLAUDE_PLUGIN_ROOT: path.resolve(__dirname, '..'),
      CLAUDE_PLUGIN_DATA: path.join(root, 'data'),
    };
    const runHook = (event, payload) => {
      const stdout = childProcess.execFileSync('/bin/sh', ['-c', commands[event]], {
        encoding: 'utf8',
        env: environment,
        input: `${JSON.stringify({ ...payload, hook_event_name: event })}\n`,
      });
      return JSON.parse(stdout.trim() || '{}');
    };

    const guarded = { session_id: 'doctor-guard', cwd };
    runHook('UserPromptExpansion', { ...guarded, command_name: 'pave:pave' });
    const denied = runHook('PreToolUse', {
      ...guarded,
      tool_name: 'Write',
      tool_input: { file_path: target, content: 'replacement\n' },
    });

    const lifecycle = { session_id: 'doctor-lifecycle', cwd };
    runHook('UserPromptSubmit', { ...lifecycle, prompt: '$pave:pave canary' });
    runHook('Stop', { ...lifecycle, last_assistant_message: 'Read-only canary complete.' });
    const released = runHook('PreToolUse', {
      ...lifecycle,
      tool_name: 'Write',
      tool_input: { file_path: target, content: 'replacement\n' },
    });

    return denied.hookSpecificOutput?.permissionDecision === 'deny'
      && !released.hookSpecificOutput
      && fs.readFileSync(target, 'utf8') === 'preserve me\n';
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    let input = {};
    try {
      input = raw.trim() ? JSON.parse(raw) : {};
      process.stdout.write(`${JSON.stringify(handleHook(input))}\n`);
    } catch (error) {
      const event = input.hook_event_name || input.hookEventName;
      const dataDir = defaultDataDir();
      let active = false;
      try { active = Boolean(readState(input, dataDir)); } catch { active = true; }
      if (active && event === 'PreToolUse') {
        process.stdout.write(`${JSON.stringify(deny(`PAVE workflow guard failed closed: ${error.message}`))}\n`);
      } else if (active && event === 'Stop') {
        process.stdout.write(`${JSON.stringify(block(`PAVE workflow guard failed closed: ${error.message}`))}\n`);
      } else {
        process.stdout.write('{}\n');
      }
    }
  });
}

if (require.main === module) main();

module.exports = {
  handleHook,
  isVerificationCommand,
  runSelfCheck,
  shellOverwrite,
};
