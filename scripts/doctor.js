#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

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
  'docs/06-architecture.md',
];

const requiredDirs = [
  '.codex/pave/plans',
  '.codex/pave/reports',
];

function usage() {
  console.log(`Usage: doctor.js <repo-path>

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
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
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

  if (missing.length > 0) {
    console.log('PAVE doctor failed. Missing:');
    for (const rel of missing) {
      console.log(`- ${rel}`);
    }
    return 1;
  }

  console.log('PAVE doctor passed.');
  return 0;
}

if (require.main === module) {
  process.exitCode = run();
}

module.exports = { run };
