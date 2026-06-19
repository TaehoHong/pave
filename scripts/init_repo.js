#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const pluginRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(pluginRoot, 'skills', 'pave', 'assets');
const repoTemplate = path.join(assetsRoot, 'repo-template');
const docTemplates = path.join(assetsRoot, 'docs-templates');

function usage() {
  console.log(`Usage: init_repo.js <repo-path> [--force] [--dry-run] [--skip-docs]

Initialize a repository with PAVE runtime and starter docs.
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
    force: false,
    dryRun: false,
    skipDocs: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') {
      options.force = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--skip-docs') {
      options.skipDocs = true;
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

function collectFiles(rootDir) {
  const files = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const next = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(next);
      } else if (entry.isFile()) {
        files.push(next);
      }
    }
  }

  walk(rootDir);
  return files;
}

function copyTree(srcRoot, dstRoot, options) {
  const created = [];
  const skipped = [];

  for (const src of collectFiles(srcRoot)) {
    const rel = path.relative(srcRoot, src);
    const dst = path.join(dstRoot, rel);

    if (isFile(dst) && !options.force) {
      skipped.push(dst);
      continue;
    }

    created.push(dst);
    if (!options.dryRun) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
    }
  }

  return { created, skipped };
}

function run(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const repo = options.repo;

  if (!fs.existsSync(repo)) {
    if (options.dryRun) {
      console.log(`would create repo directory: ${repo}`);
    } else {
      fs.mkdirSync(repo, { recursive: true });
    }
  }

  const legacy = path.join(repo, '.codex', 'ai-dev-harness');
  const current = path.join(repo, '.codex', 'pave');
  if (fs.existsSync(legacy) && !fs.existsSync(current)) {
    console.log('legacy harness detected: .codex/ai-dev-harness');
    console.log('PAVE will install .codex/pave without deleting legacy files.');
  }

  const runtime = copyTree(repoTemplate, repo, options);
  const docs = options.skipDocs
    ? { created: [], skipped: [] }
    : copyTree(docTemplates, path.join(repo, 'docs'), options);

  for (const filePath of [...runtime.created, ...docs.created]) {
    console.log(options.dryRun ? `would create: ${filePath}` : `created: ${filePath}`);
  }

  for (const filePath of [...runtime.skipped, ...docs.skipped]) {
    console.log(`skipped existing: ${filePath}`);
  }

  console.log(options.dryRun ? 'PAVE dry run complete.' : 'PAVE initialization complete.');
  return 0;
}

if (require.main === module) {
  process.exitCode = run();
}

module.exports = { run, copyTree, collectFiles };
