const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const node = process.execPath;

function run(args, options = {}) {
  return spawnSync(args[0], args.slice(1), {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  });
}

test('PAVE automation uses JavaScript helpers instead of Python helpers', () => {
  for (const script of ['init_repo.js', 'doctor.js', 'sync_template.js']) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'scripts', script)), true, `${script} should exist`);
  }

  for (const script of ['init_repo.py', 'doctor.py', 'sync_template.py']) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'scripts', script)), false, `${script} should be removed`);
  }
});

test('init_repo.js installs the repo template and doctor.js accepts it without companions', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-js-test-'));

  const init = run([node, 'scripts/init_repo.js', tmp]);
  assert.equal(init.status, 0, init.stderr || init.stdout);
  assert.match(init.stdout, /PAVE initialization complete/);

  const doctor = run([node, 'scripts/doctor.js', tmp, '--companions', 'none']);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  assert.match(doctor.stdout, /PAVE doctor passed/);
});

test('documentation points to JavaScript helper scripts', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const skill = fs.readFileSync(path.join(repoRoot, 'skills/pave/SKILL.md'), 'utf8');

  assert.match(readme, /scripts\/doctor\.js/);
  assert.doesNotMatch(readme, /python3\s+scripts\//);
  assert.match(skill, /scripts\/init_repo\.js/);
  assert.doesNotMatch(skill, /scripts\/init_repo\.py/);
});

test('documentation clarifies Claude agent adapter boundary', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const readmeKr = fs.readFileSync(path.join(repoRoot, 'README.kr.md'), 'utf8');

  assert.match(readme, /shared PAVE source of truth stays in `\.codex\/pave\/` and the PAVE plugin role briefs/);
  assert.match(readme, /`\.claude\/agents\/` is a Claude Code adapter copy used for agent discovery/);
  assert.match(readme, /manual\/offline repo runtime install without companion checks/);
  assert.doesNotMatch(readme, /Claude Code-only manual\/offline repo runtime install/);

  assert.match(readmeKr, /공유 원본은 `\.codex\/pave\/`와 PAVE plugin role briefs/);
  assert.match(readmeKr, /`\.claude\/agents\/`는 Claude Code가 agent를 발견하기 위한 repo-local adapter copy/);
  assert.match(readmeKr, /companion check 없이 repo runtime 수동\/오프라인 설치/);
  assert.doesNotMatch(readmeKr, /Claude Code-only 수동\/오프라인 repo runtime 설치/);
});

test('Claude Code templates describe role agents as adapter copies', () => {
  const files = [
    'skills/pave/assets/repo-template/CLAUDE.md',
    'skills/pave/assets/repo-template/.codex/pave/adapters/claude-code.md',
    'skills/pave/assets/repo-template/.claude/commands/pave.md',
    'commands/pave.md',
  ];

  for (const rel of files) {
    const content = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    assert.match(content, /shared PAVE source of truth/);
    assert.match(content, /Claude Code adapter (copy|surface)/);
  }
});

test('root marketplace manifest exposes PAVE through the supported plugin path', () => {
  const marketplacePath = path.join(repoRoot, '.agents', 'plugins', 'marketplace.json');
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));

  assert.equal(marketplace.name, 'pave');
  assert.equal(marketplace.plugins[0].name, 'pave');
  assert.deepEqual(marketplace.plugins[0].source, {
    source: 'local',
    path: './plugins/pave',
  });
  assert.equal(fs.readlinkSync(path.join(repoRoot, 'plugins', 'pave')), '..');
});

test('Claude Code marketplace manifest exposes the same PAVE plugin path', () => {
  const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');
  const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
  const pluginPath = path.join(repoRoot, '.claude-plugin', 'plugin.json');
  const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

  assert.equal(marketplace.name, 'pave');
  assert.equal(marketplace.plugins[0].name, 'pave');
  assert.equal(marketplace.plugins[0].source, './plugins/pave');
  assert.equal(plugin.name, 'pave');
  assert.match(plugin.description, /PAVE/);
  assert.equal(fs.lstatSync(path.join(repoRoot, 'commands', 'pave.md')).isFile(), true);
  assert.equal(fs.lstatSync(path.join(repoRoot, 'agents', 'planner.md')).isFile(), true);
});

test('project-init command is a dedicated initialization entrypoint', () => {
  const commandPath = path.join(repoRoot, 'commands', 'project-init.md');
  const command = fs.readFileSync(commandPath, 'utf8');

  assert.match(command, /^# \/project-init/m);
  assert.match(command, /Project Initialization/);
  assert.match(command, /Do not route this request to feature, bug, review, refactor, docs sync, continuation, or status workflows/);
  assert.match(command, /scripts\/doctor\.js <repo> --companions <profile>/);
});

test('installation guide starts from Codex marketplace install and separates Claude Code', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');

  assert.match(readme, /codex plugin add superpowers@claude-plugins-official/);
  assert.match(readme, /codex plugin marketplace add TaehoHong\/pave --ref main/);
  assert.match(readme, /codex plugin add pave@pave/);
  assert.match(readme, /\/project-init/);
  assert.doesNotMatch(readme, /Start from any folder where you keep tools:[\s\S]*git clone https:\/\/github\.com\/TaehoHong\/pave\.git/);
  assert.match(readme, /claude plugin marketplace add TaehoHong\/pave/);
  assert.doesNotMatch(readme, /claude plugin marketplace add TaehoHong\/pave --sparse/);
  assert.match(readme, /claude plugin install pave@pave/);
  assert.doesNotMatch(readme, /\/pave Initialize this repository with PAVE/);
  assert.match(readme, /\.\/scripts\/install\.sh <repo-path> --companions none/);
});

test('install.sh dry-run does not execute codex plugin add', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-dry-run-test-'));
  const bin = path.join(tmp, 'bin');
  const log = path.join(tmp, 'codex.log');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'codex'), `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$CODEX_LOG"
exit 0
`);
  fs.chmodSync(path.join(bin, 'codex'), 0o755);

  const install = run(['bash', 'scripts/install.sh', path.join(tmp, 'repo'), '--dry-run'], {
    env: {
      ...process.env,
      CODEX_LOG: log,
      HOME: path.join(tmp, 'home'),
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    },
  });

  assert.equal(install.status, 0, install.stderr || install.stdout);
  const codexCalls = fs.readFileSync(log, 'utf8');
  assert.doesNotMatch(codexCalls, /plugin add/);
  assert.match(install.stdout, /would create repo directory/);
});
