#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const STATE_VERSION = 6;
const BLOCKED_REPORT = '<!-- PAVE_BLOCKED -->';
const ROUTE_COMMAND_HINT = 'resolve the loaded PAVE SKILL.md path, then run node "<pave-plugin-root>/scripts/workflow-guard.js" route <fast|bug|feature|reset>';
const APPROVAL_PHRASES = new Set([
  '추천대로', '추천대로 진행해', '이대로', '이대로 진행해', '진행해', '진행해줘',
  '구현해', '구현해줘', '시작해', '시작해줘', '승인', '승인해', '승인합니다',
  'approve', 'approved', 'proceed', 'go ahead', 'implement', 'implement it', 'start',
]);
const DDL_APPROVAL_PHRASES = new Set([
  'ddl 승인', 'ddl까지 승인', 'ddl 포함 진행해', 'ddl 포함해서 진행해',
  'approve ddl', 'approve with ddl', 'proceed with ddl',
]);

const STANDARD_REFERENCES = {
  feature: ['context-retrieval', 'design', 'testing', 'planning', 'execution-loop'],
  bug: ['context-retrieval', 'request-routing', 'debugging', 'testing', 'memory', 'execution-loop'],
  fast: ['context-retrieval', 'fast-path', 'testing', 'verification'],
};

const UI_EXTENSIONS = new Set([
  '.css', '.html', '.jsx', '.less', '.scss', '.svelte', '.tsx', '.vue',
]);
const DDL_DOCUMENTATION_EXTENSIONS = new Set(['.md', '.mdx', '.rst', '.txt']);

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

function withStateLock(input, dataDir, callback) {
  const lock = `${statePath(input, dataDir)}.lock`;
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  const sleeper = new Int32Array(new SharedArrayBuffer(4));
  let descriptor;

  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      descriptor = fs.openSync(lock, 'wx', 0o600);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      try {
        if (Date.now() - fs.statSync(lock).mtimeMs > 10_000) fs.unlinkSync(lock);
      } catch (lockError) {
        if (lockError.code !== 'ENOENT') throw lockError;
      }
      Atomics.wait(sleeper, 0, 0, 5);
    }
  }

  if (descriptor === undefined) throw new Error('timed out waiting for the session state lock');
  try {
    return callback();
  } finally {
    fs.closeSync(descriptor);
    try { fs.unlinkSync(lock); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
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
  return /^\s*(?:\$pave:pave|\/pave(?::pave)?)(?=\s|$)/i.test(String(prompt || ''));
}

function isPaveExpansion(input) {
  return /^(?:pave:)?pave$/i.test(String(input.command_name || input.commandName || ''));
}

function isPaveSkillInvocation(input) {
  if (toolName(input) !== 'Skill') return false;
  const details = toolInput(input);
  return /^(?:pave:)?pave$/i.test(String(details.skill || details.name || ''));
}

function approvalIntent(prompt) {
  const normalized = String(prompt || '')
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (DDL_APPROVAL_PHRASES.has(normalized)) return { ddl: true };
  if (APPROVAL_PHRASES.has(normalized)) return { ddl: false };
  return null;
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
    selectedRoute: null,
    references: {},
    awaitingApproval: false,
    approved: false,
    ddlApproved: false,
    editedAt: null,
    changedFiles: [],
    substantiveLines: 0,
    diffInspectedAt: null,
    statusInspectedAt: null,
    inspectedFiles: {},
    createdFiles: [],
    statusHasTrackedChanges: false,
    verifiedAt: null,
    activatedAt: timestamp,
  };
}

function recordApproval(state, ddl, timestamp) {
  const selectedRoute = route(state);
  if (selectedRoute !== 'feature' && selectedRoute !== 'bug') {
    return `PAVE cannot approve standard implementation. Current route: ${selectedRoute}. ${routeGuidance(selectedRoute)}`;
  }
  const preApproval = STANDARD_REFERENCES[selectedRoute].filter((name) => name !== 'execution-loop');
  const missing = missingReferences(state, preApproval);
  if (missing.length > 0) {
    return `PAVE cannot approve implementation yet. Current route: ${selectedRoute}. Missing reference evidence: ${missing.join(', ')}.`;
  }
  state.awaitingApproval = false;
  state.approved = true;
  state.approvedAt = timestamp;
  if (ddl) {
    state.ddlApproved = true;
    state.ddlApprovedAt = timestamp;
  }
  return null;
}

function recordApprovalRequest(state, timestamp) {
  const selectedRoute = route(state);
  if (selectedRoute !== 'feature' && selectedRoute !== 'bug') {
    return `PAVE cannot request standard implementation approval. Current route: ${selectedRoute}. ${routeGuidance(selectedRoute)}`;
  }
  const preApproval = STANDARD_REFERENCES[selectedRoute].filter((name) => name !== 'execution-loop');
  const missing = missingReferences(state, preApproval);
  if (missing.length > 0) {
    return `PAVE cannot request implementation approval yet. Current route: ${selectedRoute}. Missing reference evidence: ${missing.join(', ')}.`;
  }
  state.awaitingApproval = true;
  state.approved = false;
  state.ddlApproved = false;
  state.approvalRequestedAt = timestamp;
  return null;
}

function isApprovalPlanUpdate(input) {
  if (toolName(input) !== 'update_plan') return false;
  const plan = toolInput(input).plan;
  return Array.isArray(plan) && plan.some((item) => (
    item?.status === 'in_progress' && /^\[PAVE:approval\]/.test(String(item?.step || ''))
  ));
}

function approvalQuestion(input) {
  const name = toolName(input);
  const questions = toolInput(input).questions;
  if (!Array.isArray(questions)) return null;
  if (name === 'request_user_input') {
    if (questions.some((question) => question?.id === 'pave_ddl_approval')) {
      return { kind: 'ddl', answerKey: 'pave_ddl_approval' };
    }
    if (questions.some((question) => question?.id === 'pave_implementation_approval')) {
      return { kind: 'standard', answerKey: 'pave_implementation_approval' };
    }
  }
  if (name === 'AskUserQuestion') {
    const paveQuestions = questions.filter((question) => question?.header === 'PAVE DDL' || question?.header === 'PAVE approve');
    if (questions.length !== 1 || paveQuestions.length !== 1) return null;
    return { kind: paveQuestions[0].header === 'PAVE DDL' ? 'ddl' : 'standard' };
  }
  return null;
}

function structuredApproval(input) {
  if (!isSuccessful(input)) return null;
  if (toolName(input) === 'ExitPlanMode') return { ddl: false };
  const question = approvalQuestion(input);
  if (!question) return null;
  const response = input.tool_response || input.toolResponse || {};
  const answers = response.answers && typeof response.answers === 'object' ? response.answers : {};
  const selection = question.answerKey
    ? answers[question.answerKey]
    : Object.values(answers).length === 1 ? Object.values(answers)[0] : null;
  const selectedText = String(selection || '').toLowerCase();
  if (/(revise|수정|declin|거절|cancel|취소)/.test(selectedText)) return null;
  if (!/(implement|approve|proceed|구현|승인|진행)/.test(selectedText)) return null;
  if (question.kind === 'ddl' && !/(ddl|스키마)/.test(selectedText)) return null;
  return { ddl: question.kind === 'ddl' };
}

function route(state) {
  return state.selectedRoute || 'unknown';
}

function routeGuidance(selectedRoute) {
  if (selectedRoute === 'fast') {
    return `Leave the fast path by explicitly declaring bug or feature, or clear only the route with: ${ROUTE_COMMAND_HINT}.`;
  }
  return `Declare the route explicitly with: ${ROUTE_COMMAND_HINT}. Reference reads provide evidence and never select a route.`;
}

function routeDeclaration(command, pluginRoot) {
  const segments = commandSegments(command);
  if (segments.length !== 1) return null;
  const match = segments[0].match(/^node\s+("[^"]+"|'[^']+'|\S+)\s+route\s+(fast|bug|feature|reset)\s*$/);
  if (!match) return null;
  const script = match[1].replace(/^(?:"|')|(?:"|')$/g, '');
  const expected = path.join(pluginRoot, 'scripts', 'workflow-guard.js');
  const pluginExpressions = new Set([
    '${CLAUDE_PLUGIN_ROOT:-${PLUGIN_ROOT}}/scripts/workflow-guard.js',
    '${CLAUDE_PLUGIN_ROOT}/scripts/workflow-guard.js',
    '$CLAUDE_PLUGIN_ROOT/scripts/workflow-guard.js',
    '${PLUGIN_ROOT}/scripts/workflow-guard.js',
    '$PLUGIN_ROOT/scripts/workflow-guard.js',
  ]);
  if (path.resolve(script) !== expected && !pluginExpressions.has(script)) return null;
  return match[2];
}

function recordRouteDeclaration(state, declaration, timestamp) {
  const selectedRoute = declaration === 'reset' ? null : declaration;
  if (state.selectedRoute === selectedRoute && declaration !== 'reset') return;
  state.selectedRoute = selectedRoute;
  state.routeDeclaredAt = timestamp;
  state.awaitingApproval = false;
  state.approved = false;
  state.ddlApproved = false;
  delete state.approvalRequestedAt;
  delete state.approvedAt;
  delete state.ddlApprovedAt;
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

function referencesInCommand(command, pluginRoot, cwd) {
  const names = [];
  const referencesRoot = path.join(pluginRoot, 'skills', 'pave', 'references');
  for (const segment of commandSegments(command)) {
    if (!/^\s*(?:cat|head|tail|less|sed\s+-n)\b/.test(segment)) continue;
    const words = segment.matchAll(/"([^"]+)"|'([^']+)'|([^\s;&|]+)/g);
    for (const match of words) {
      const word = match[1] || match[2] || match[3];
      const reference = word.match(/(?:^|\/)references\/([a-z0-9-]+)\.md$/);
      if (!reference || word.includes('$')) continue;
      const absolute = path.resolve(cwd, word);
      if (path.dirname(absolute) === referencesRoot) names.push(reference[1]);
    }
  }
  return names;
}

function readShellWord(text, start) {
  let word = '';
  let quote = null;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (escaped) {
      word += character;
      escaped = false;
      continue;
    }
    if (character === '\\' && quote !== "'") {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = null;
      else word += character;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (/\s/.test(character) || /[;&|]/.test(character)) break;
    word += character;
  }
  return word;
}

function scanShell(command) {
  const text = String(command || '');
  const segments = [];
  const outputTargets = [];
  let current = '';
  let quote = null;
  let escaped = false;
  let commandSubstitution = false;
  let processSubstitution = false;
  let orFallback = false;

  const pushSegment = () => {
    const segment = current.trim();
    if (segment) segments.push(segment);
    current = '';
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === '\\' && quote !== "'") {
      current += character;
      escaped = true;
      continue;
    }
    if (quote) {
      current += character;
      if (character === quote) quote = null;
      else if (quote === '"' && (character === '`' || (character === '$' && next === '('))) {
        commandSubstitution = true;
      }
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      current += character;
      continue;
    }
    if (character === '`' || (character === '$' && next === '(')) commandSubstitution = true;
    if (character === '<' && next === '(') processSubstitution = true;
    if (character === '>' && text[index - 1] !== '<' && text[index - 1] !== '>') {
      let targetStart = index + (next === '>' ? 2 : 1);
      if (text[targetStart] === '|') targetStart += 1;
      while (/\s/.test(text[targetStart] || '')) targetStart += 1;
      if (text[targetStart] === '&' && /\d/.test(text[targetStart + 1] || '')) {
        outputTargets.push(`&${text[targetStart + 1]}`);
      } else {
        outputTargets.push(readShellWord(text, targetStart));
      }
    }
    if (character === '&' && next === '&') {
      pushSegment();
      index += 1;
      continue;
    }
    if (character === '|' || character === ';' || character === '\n') {
      if (character === '|' && next === '|') {
        orFallback = true;
        index += 1;
      }
      pushSegment();
      continue;
    }
    current += character;
  }
  pushSegment();
  return { segments, outputTargets, commandSubstitution, processSubstitution, orFallback };
}

function commandSegments(command) {
  return scanShell(command).segments;
}

function hasUnsafeOutputRedirection(command) {
  return scanShell(command).outputTargets.some((target) => !['/dev/null', '&1', '&2'].includes(target));
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

function recordStatusSummary(state, output) {
  const entries = String(output || '').split('\n')
    .filter((line) => /^(?:\?\?|[ MADRCU?!]{2})\s/.test(line));
  state.statusHasTrackedChanges = entries.some((line) => !line.startsWith('?? '));
}

function isReadOnlyGit(segment) {
  const match = segment.match(/^git\s+([a-z-]+)\b(.*)$/);
  if (!match) return false;
  const [, subcommand, rawArguments] = match;
  const argumentsText = rawArguments.trim();
  if (/(?:^|\s)--output(?:=|\s|$)/.test(argumentsText)) return false;

  if (subcommand === 'branch') {
    if (!argumentsText) return true;
    if (/^--list(?:\s|$)/.test(argumentsText)) return true;
    return /^(?:(?:-a|-r|-v|-vv|--show-current|--merged(?:=\S+)?|--no-merged(?:=\S+)?|--contains(?:=\S+)?|--no-contains(?:=\S+)?)(?:\s+|$))*$/.test(argumentsText);
  }
  if (subcommand === 'remote') {
    return !argumentsText || argumentsText === '-v' || /^(?:show|get-url)(?:\s|$)/.test(argumentsText);
  }
  return /^(?:status|diff|log|show|rev-parse|ls-files|grep|check-ignore)$/.test(subcommand);
}

function hasSedWriteCommand(segment) {
  if (!/^sed\s+-n\b/.test(segment)) return false;
  const scripts = [...segment.matchAll(/"([^"]*)"|'([^']*)'/g)].map((match) => match[1] || match[2] || '');
  return scripts.some((script) => /(?:^|[;\s])(?:\d+(?:,\d+)?\s*)?w(?:\s|$)/.test(script));
}

function isReadOnlyBash(command) {
  const text = String(command || '');
  if (!text.trim()) return true;
  const shell = scanShell(text);
  const unsafeToolOptions = shell.segments.some((part) => (
    (/^find\b/.test(part) && /(?:-delete|-exec|-execdir)\b/.test(part))
    || (/^rg\b/.test(part) && /\s--pre\b/.test(part))
    || (/^sed\b/.test(part) && /\s-i(?:\s|$)/.test(part))
    || hasSedWriteCommand(part)
  ));
  if (hasUnsafeOutputRedirection(text)
    || shell.commandSubstitution
    || shell.processSubstitution
    || shell.orFallback
    || unsafeToolOptions) return false;

  return shell.segments.every((part) => (
    /^(?:pwd|ls|rg|grep|cat|head|tail|less|wc|stat|file|readlink|realpath|test)\b/.test(part)
    || /^sed\s+-n\b/.test(part)
    || (/^find\b/.test(part) && !/(?:-delete|-exec|-execdir)\b/.test(part))
    || isReadOnlyGit(part)
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
  return commandSegments(command).some((segment) => (
    (/^(?:cat|printf|echo)\b/.test(segment) && hasUnsafeOutputRedirection(segment))
    || /^tee(?:\s+-a)?\s+[^|\s]/.test(segment)
    || /^sed\b[^\n]*\s-i(?:\s|$)/.test(segment)
  ));
}

function containsDdl(value) {
  return /\b(?:CREATE\s+(?:OR\s+REPLACE\s+)?(?:TEMP(?:ORARY)?\s+)?(?:UNIQUE\s+)?(?:VIRTUAL\s+TABLE|TABLE|INDEX|VIEW|MATERIALIZED\s+VIEW|TYPE|SCHEMA|DATABASE|SEQUENCE|FUNCTION|PROCEDURE|TRIGGER|POLICY|EXTENSION|ROLE|USER)|ALTER\s+(?:TABLE|INDEX|VIEW|MATERIALIZED\s+VIEW|TYPE|SCHEMA|DATABASE|SEQUENCE|FUNCTION|PROCEDURE|TRIGGER|POLICY|ROLE|USER)|DROP\s+(?:TABLE|INDEX|VIEW|MATERIALIZED\s+VIEW|TYPE|SCHEMA|DATABASE|SEQUENCE|FUNCTION|PROCEDURE|TRIGGER|POLICY|EXTENSION|ROLE|USER)|TRUNCATE(?:\s+TABLE)?|RENAME\s+TABLE|GRANT\b|REVOKE\b)\b/i.test(String(value || ''));
}

function isDatabaseDefinitionPath(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/').toLowerCase();
  const basename = path.posix.basename(normalized);
  return /\/(?:migrations?|drizzle)\//.test(normalized)
    || /\/prisma\/schema\.prisma$/.test(normalized)
    || /\/(?:db|database|drizzle)\/schema\.(?:[cm]?[jt]s|prisma|py|rb|sql)$/.test(normalized)
    || /\/db\/(?:schema\.rb|structure\.sql)$/.test(normalized)
    || /\.migrations?\.(?:[cm]?[jt]s|py|rb|sql)$/.test(normalized)
    || basename === 'schema.sql';
}

function ddlEditText(input) {
  const details = toolInput(input);
  if (toolName(input) === 'Write') return details.content;
  if (toolName(input) === 'Edit') return `${details.old_string || ''}\n${details.new_string || ''}`;
  if (toolName(input) === 'ApplyPatch') return patchText(details);
  return '';
}

function isDdlEdit(state, input) {
  const targets = editTargets(state, input);
  if (targets.some(isDatabaseDefinitionPath)) return true;
  return targets.some((filePath) => !DDL_DOCUMENTATION_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    && containsDdl(ddlEditText(input));
}

function isDdlBash(command) {
  const text = String(command || '');
  if (isReadOnlyBash(text)) return false;
  if (containsDdl(text)) return true;
  if (/(?:^|[;&|]\s*|\n)\s*(?:(?:npx\s+|pnpm\s+(?:exec\s+)?|yarn\s+|bunx\s+|bundle\s+exec\s+)?(?:prisma\s+(?:migrate|db\s+push)|drizzle-kit\s+(?:generate|migrate|push)|knex\s+migrate|sequelize(?:-cli)?\s+db:migrate|typeorm\s+migration:(?:generate|run|revert)|rails\s+db:(?:migrate|schema:load)|rake\s+db:(?:migrate|schema:load)|alembic\s+(?:upgrade|downgrade|revision)|flyway\s+(?:migrate|clean)|liquibase\s+(?:update|rollback|drop-all)|dbmate\s+(?:up|down|migrate)|sqlx\s+migrate|diesel\s+migration|atlas\s+(?:schema\s+apply|migrate\s+apply)|supabase\s+(?:db\s+push|migration\s+up)|dotnet\s+ef\s+(?:database\s+update|migrations\s+add)|python\S*\s+\S*manage\.py\s+migrate|php\s+artisan\s+migrate|mix\s+ecto\.migrate))\b/i.test(text)) return true;
  if (/(?:^|[;&|]\s*|\n)\s*(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:[a-z0-9_-]+:)*(?:migrate|migration|schema(?::(?:push|apply|load))?|db:push)\b/i.test(text)) return true;
  return /(?:^|[\s'"`])(?:[^\s'"`]*\/)?(?:migrations?|drizzle)\//i.test(text)
    || /(?:^|[\s'"`])(?:[^\s'"`]*\/)?(?:schema\.sql|prisma\/schema\.prisma|db\/(?:schema\.rb|structure\.sql))\b/i.test(text);
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

function preToolUse(input, state, options) {
  const name = toolName(input);
  const details = toolInput(input);
  const declaration = name === 'Bash' ? routeDeclaration(commandText(details), options.pluginRoot) : null;

  if (declaration) return {};

  if (name === 'Bash' && shellOverwrite(commandText(details))) {
    return deny('PAVE blocks shell redirection and in-place shell writes. Use Edit for an existing file or Write for a confirmed-new file.');
  }

  const ddlOperation = name === 'Bash'
    ? isDdlBash(commandText(details))
    : (name === 'Write' || name === 'Edit' || name === 'ApplyPatch') && isDdlEdit(state, input);
  if (ddlOperation && !state.ddlApproved) {
    return deny('PAVE DDL approval has not been recorded. Surface the exact DDL targets, statements, impact, and rollback, then obtain explicit user approval.');
  }

  if (name === 'Bash' && !isReadOnlyBash(commandText(details))) {
    const selectedRoute = route(state);
    if (selectedRoute === 'fast') {
      return deny(`PAVE fast path blocks shell commands that may mutate files because its file and line limits cannot be verified. Current route: fast. Use Edit or Write, or leave the fast path with: ${ROUTE_COMMAND_HINT}.`);
    }
    if (selectedRoute === 'unknown') {
      return deny(`PAVE cannot run a mutating shell command. Current route: unknown. ${routeGuidance(selectedRoute)}`);
    }
    const missing = missingReferences(state, STANDARD_REFERENCES[selectedRoute]);
    if (missing.length > 0) {
      return deny(`PAVE required reference evidence is missing. Current route: ${selectedRoute}. Read and apply: ${missing.join(', ')}.`);
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
    return deny(`PAVE cannot edit yet. Current route: unknown. ${routeGuidance(selectedRoute)}`);
  }

  const missing = missingReferences(state, STANDARD_REFERENCES[selectedRoute]);
  if (missing.length > 0) {
    return deny(`PAVE required reference evidence is missing. Current route: ${selectedRoute}. Read and apply: ${missing.join(', ')}.`);
  }

  if (selectedRoute !== 'fast' && !state.approved) {
    return deny('PAVE implementation approval has not been recorded for the surfaced boundary and resolved decisions.');
  }

  if (filePaths.some(isUiPath) && !state.references['design-system']) {
    return deny('PAVE requires design-system.md evidence before a user-visible edit.');
  }

  if (selectedRoute === 'fast') {
    if (filePaths.some((filePath) => /(?:^|\/)(?:middleware|migrations?|schema|auth|security|permissions?)(?:[./_-]|$)/i.test(filePath))) {
      return deny(`PAVE fast path does not allow middleware, schema, auth, security, or permission changes. Current route: fast. ${routeGuidance(selectedRoute)}`);
    }
    const predicted = predictedFastChange(state, input, filePaths[0]);
    predicted.files = new Set([...state.changedFiles, ...filePaths]).size;
    if (predicted.files > 2 || predicted.lines > 20) {
      return deny(`PAVE fast path is limited to two hand-edited files and twenty substantive hand-edited lines. Current route: fast. ${routeGuidance(selectedRoute)}`);
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
    const declaration = routeDeclaration(command, options.pluginRoot);
    if (declaration) {
      recordRouteDeclaration(state, declaration, timestamp);
      return;
    }
    const output = responseText(input);
    if (output.trim()) {
      for (const reference of referencesInCommand(command, options.pluginRoot, state.cwd)) {
        state.references[reference] = timestamp;
      }
    }
    const inspectedDiff = isActualGitCommand(command, 'diff')
      && !commandSegments(command).some((part) => /^git\s+diff\b.*--check\b/.test(part));
    if (inspectedDiff && diffCoversChangedFile(state, output)) state.diffInspectedAt = timestamp;
    if (isActualGitCommand(command, 'status')) {
      state.statusInspectedAt = timestamp;
      recordStatusSummary(state, output);
    }
    if (isVerificationEvidenceCommand(command)) state.verifiedAt = timestamp;
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
      state.createdFiles ||= [];
      for (const filePath of addedFiles) {
        if (!state.createdFiles.includes(filePath)) state.createdFiles.push(filePath);
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

function isVerificationSegment(part) {
  return (
    /^(?:npm|pnpm|yarn|bun)\s+(?:(?:run|exec)\s+)?(?:test|check|lint|build|typecheck)\b/i.test(part)
    || /^npx\s+(?:vitest|jest|tsc|eslint)\b/i.test(part)
    || /^(?:pytest|cargo\s+test|go\s+test|mvn\s+test|gradle\s+test)\b/i.test(part)
  );
}

function isVerificationCommand(command) {
  return commandSegments(command).some(isVerificationSegment);
}

function isVerificationEvidenceCommand(command) {
  const shell = scanShell(command);
  return shell.segments.length === 1 && !shell.orFallback && isVerificationSegment(shell.segments[0]);
}

function diffCoversChangedFile(state, output) {
  if (!String(output || '').trim()) return false;
  if (state.shellMutation && state.changedFiles.length === 0) return true;
  const changed = new Set(state.changedFiles.map((filePath) => path.resolve(filePath)));
  for (const line of String(output).split('\n')) {
    const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
    if (match && (changed.has(path.resolve(state.cwd, match[1])) || changed.has(path.resolve(state.cwd, match[2])))) {
      return true;
    }
  }
  return false;
}

function handleStop(input, state, options) {
  const message = String(input.last_assistant_message || input.lastAssistantMessage || '');

  if (state.editedAt) {
    if (message.includes(BLOCKED_REPORT)) return { output: {}, remove: false };

    const missing = [];
    if (!(state.statusInspectedAt >= state.editedAt)) missing.push('successful git status inspection');
    const created = new Set(state.createdFiles || []);
    const trackedChanges = state.changedFiles.some((filePath) => !created.has(filePath))
      || (state.shellMutation && state.changedFiles.length === 0 && state.statusHasTrackedChanges);
    if (trackedChanges && !(state.diffInspectedAt >= state.editedAt)) missing.push('successful non-empty git diff inspection');
    const uninspected = [...created].filter((filePath) => fs.existsSync(filePath)
      && !((state.inspectedFiles || {})[filePath] >= state.editedAt));
    if (uninspected.length > 0) {
      missing.push(`post-edit inspection of untracked files (${uninspected.map((filePath) => path.relative(state.cwd, filePath)).join(', ')})`);
    }
    if (!(state.verifiedAt >= state.editedAt)) {
      missing.push('successful standalone verification command (run directly, without pipes, fallbacks, or trailing commands)');
    }
    if (missing.length > 0) {
      return { output: block(`PAVE cannot claim completion yet. Missing: ${missing.join(', ')}. Complete these checks before stopping. If genuinely waiting for required user input, return a blocked report containing ${BLOCKED_REPORT}.`), remove: false };
    }
    return { output: {}, remove: true };
  }

  return { output: {}, remove: route(state) === 'unknown' };
}

function handleHook(input, providedOptions = {}) {
  const dataDir = providedOptions.dataDir || defaultDataDir();
  const event = input.hook_event_name || input.hookEventName;
  const activatesState = (event === 'UserPromptSubmit' && isPaveInvocation(input.prompt))
    || (event === 'UserPromptExpansion' && isPaveExpansion(input))
    || (event === 'PreToolUse' && isPaveSkillInvocation(input));
  const mutatesState = event !== 'PreToolUse' || isPaveSkillInvocation(input);
  const observedState = activatesState ? null : readState(input, dataDir);
  const hasState = activatesState || Boolean(observedState);
  if (!providedOptions.lockHeld && mutatesState && hasState) {
    return withStateLock(input, dataDir, () => handleHook(input, {
      ...providedOptions,
      dataDir,
      lockHeld: true,
    }));
  }
  const options = {
    dataDir,
    pluginRoot: path.resolve(providedOptions.pluginRoot || __dirname, providedOptions.pluginRoot ? '.' : '..'),
    now: providedOptions.now,
  };
  let state = activatesState ? readState(input, options.dataDir) : observedState;

  if (event === 'UserPromptSubmit') {
    if (isPaveInvocation(input.prompt)) {
      state = initialState(input, now(options));
    } else if (state?.awaitingApproval) {
      const intent = approvalIntent(input.prompt);
      const error = intent ? recordApproval(state, intent.ddl, now(options)) : null;
      if (error) return block(error);
      if (!intent) {
        state.awaitingApproval = false;
        state.approved = false;
        state.ddlApproved = false;
      }
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

  if (event === 'PreToolUse') return preToolUse(input, state, options);

  if (event === 'PostToolUse') {
    if (isSuccessful(input) && isApprovalPlanUpdate(input)) {
      const error = recordApprovalRequest(state, now(options));
      if (error) return block(error);
    }
    const approval = structuredApproval(input);
    if (approval) {
      const error = recordApproval(state, approval.ddl, now(options));
      if (error) return block(error);
    }
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
    const requiredEvents = ['UserPromptSubmit', 'UserPromptExpansion', 'PreToolUse', 'PostToolUse', 'Stop'];
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
    const routeCommand = `node "${path.join(__dirname, 'workflow-guard.js')}" route fast`;
    runHook('PostToolUse', {
      ...guarded,
      tool_name: 'Bash',
      tool_input: { command: routeCommand },
      tool_response: { exit_code: 0, output: '{"route":"fast"}\n' },
    });
    const denied = runHook('PreToolUse', {
      ...guarded,
      tool_name: 'Edit',
      tool_input: { file_path: path.join(cwd, 'ordinary.ts'), old_string: 'a', new_string: 'b' },
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
      && /current route: fast/i.test(denied.hookSpecificOutput?.permissionDecisionReason || '')
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

function runRouteCommand() {
  const declaration = String(process.argv[3] || '');
  if (!/^(?:fast|bug|feature|reset)$/.test(declaration)) {
    process.stderr.write('Usage: workflow-guard.js route <fast|bug|feature|reset>\n');
    process.exitCode = 2;
    return;
  }
  process.stdout.write(`${JSON.stringify({ route: declaration })}\n`);
}

if (require.main === module) {
  if (process.argv[2] === 'route') runRouteCommand();
  else main();
}

module.exports = {
  handleHook,
  isVerificationCommand,
  runSelfCheck,
  shellOverwrite,
};
