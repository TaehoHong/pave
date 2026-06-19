#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const requiredFiles = [
  'AGENTS.md',
  'CLAUDE.md',
  '.codex/pave/README.md',
  '.codex/pave/README.kr.md',
  '.codex/pave/config.md',
  '.codex/pave/templates/plan.md',
  '.codex/pave/templates/subagent-brief.md',
  '.codex/pave/templates/final-report.md',
  '.codex/pave/templates/blocked-report.md',
  '.codex/pave/adapters/codex.md',
  '.codex/pave/adapters/claude-code.md',
  '.codex/pave/adapters/generic-agent.md',
  '.claude/commands/pave.md',
  '.claude/agents/product-manager.md',
  '.claude/agents/planner.md',
  '.claude/agents/ui-ux-designer.md',
  '.claude/agents/fullstack-developer.md',
  '.claude/agents/qa-engineer.md',
  'docs/00-overview.md',
  'docs/01-roadmap.md',
  'docs/02-development-rules.md',
  'docs/03-deployment-rules.md',
  'docs/04-design-rules.md',
  'docs/05-quality-rules.md',
];

const requiredDirs = [
  '.codex/pave/plans',
  '.codex/pave/reports',
];

function usage() {
  console.log(`Usage: doctor.js <repo-path> [--companions default|full|none]

Check whether a repository has the expected PAVE runtime files.
`);
}

function expandHome(input) {
  if (input === '~') return process.env.HOME || input;
  if (input.startsWith('~/')) return path.join(process.env.HOME || '', input.slice(2));
  return input;
}

function parseArgs(argv) {
  const options = {
    repo: '.',
    companions: 'default',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--companions') {
      const value = argv[i + 1];
      if (!['default', 'full', 'none'].includes(value)) {
        console.error('error: --companions requires default, full, or none');
        process.exit(64);
      }
      options.companions = value;
      i += 1;
    } else if (arg === '-h' || arg === '--help') {
      usage();
      process.exit(0);
    } else if (arg.startsWith('--')) {
      console.error(`error: unknown option: ${arg}`);
      usage();
      process.exit(64);
    } else if (options.repo === '.') {
      options.repo = arg;
    } else {
      console.error(`error: unexpected argument: ${arg}`);
      usage();
      process.exit(64);
    }
  }

  options.repo = path.resolve(expandHome(options.repo));
  return options;
}

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isDir(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function commandExists(command) {
  const pathValue = process.env.PATH || '';
  const extensions = process.platform === 'win32'
    ? ['', '.exe', '.cmd', '.bat']
    : [''];

  for (const dir of pathValue.split(path.delimiter)) {
    for (const ext of extensions) {
      if (isFile(path.join(dir, command + ext))) {
        return true;
      }
    }
  }
  return false;
}

function codexPluginList() {
  if (!commandExists('codex')) return '';

  const completed = spawnSync('codex', ['plugin', 'list'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return completed.stdout || '';
}

function hasVersionedSkill(baseDir, relativeSkillPath) {
  if (!isDir(baseDir)) return false;

  for (const entry of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (isFile(path.join(baseDir, entry.name, relativeSkillPath))) {
      return true;
    }
  }

  return false;
}

function hasSuperpowers() {
  const output = codexPluginList();
  if (output.split(/\r?\n/).some((line) => line.includes('superpowers@') && line.includes('installed, enabled'))) {
    return true;
  }

  const home = process.env.HOME || '';
  if (hasVersionedSkill(
    path.join(home, '.codex', 'plugins', 'cache', 'claude-plugins-official', 'superpowers'),
    path.join('skills', 'using-superpowers', 'SKILL.md'),
  )) {
    return true;
  }

  if (hasVersionedSkill(
    path.join(home, '.codex', 'plugins', 'cache', 'openai-curated-remote', 'superpowers'),
    path.join('skills', 'using-superpowers', 'SKILL.md'),
  )) {
    return true;
  }

  return [
    path.join(home, '.codex', 'skills', 'superpowers', 'using-superpowers', 'SKILL.md'),
    path.join(home, '.agents', 'skills', 'superpowers', 'using-superpowers', 'SKILL.md'),
  ].some(isFile);
}

function hasGstack() {
  const home = process.env.HOME || '';
  return [
    path.join(home, '.agents', 'skills', 'gstack', 'SKILL.md'),
    path.join(home, 'gstack', '.agents', 'skills', 'gstack', 'SKILL.md'),
  ].some(isFile) || commandExists('gstack');
}

function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const repo = options.repo;
  const missing = [];

  for (const rel of requiredFiles) {
    if (!isFile(path.join(repo, rel))) missing.push(rel);
  }

  for (const rel of requiredDirs) {
    if (!isDir(path.join(repo, rel))) missing.push(`${rel}/`);
  }

  if (isDir(path.join(repo, '.codex', 'ai-dev-harness')) && !isDir(path.join(repo, '.codex', 'pave'))) {
    console.log('warning: legacy .codex/ai-dev-harness exists without .codex/pave');
  }

  const superpowers = hasSuperpowers();
  const gstack = hasGstack();

  if (options.companions === 'none') {
    console.log('companion profile: none');
    console.log('companion: Superpowers skipped');
    console.log('companion: gstack skipped');
  } else {
    console.log(`companion profile: ${options.companions}`);
    if (superpowers) {
      console.log('companion: Superpowers detected');
    } else {
      console.log('companion: Superpowers missing');
      missing.push('Superpowers companion');
    }

    if (gstack) {
      console.log('companion: gstack detected');
    } else if (options.companions === 'full') {
      console.log('companion: gstack missing');
      missing.push('gstack companion');
    } else {
      console.log('warning: gstack not detected (optional)');
    }
  }

  if (missing.length > 0) {
    console.log('PAVE doctor failed. Missing:');
    for (const rel of missing) {
      console.log(`- ${rel}`);
    }
    if (missing.includes('Superpowers companion')) {
      console.log('Install Superpowers with one of:');
      console.log('- codex plugin add superpowers@claude-plugins-official');
      console.log('- codex plugin add superpowers@superpowers-marketplace');
      console.log('- codex plugin add superpowers@openai-curated');
    }
    return 1;
  }

  console.log('PAVE doctor passed.');
  return 0;
}

if (require.main === module) {
  process.exitCode = run();
}

module.exports = { run, hasSuperpowers, hasGstack };
