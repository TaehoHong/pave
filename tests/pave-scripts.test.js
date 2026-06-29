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
  assert.equal(fs.existsSync(path.join(tmp, 'docs', '06-architecture.md')), true);

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

test('documentation clarifies plugin-local default and Claude agent adapter boundary', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const readmeKr = fs.readFileSync(path.join(repoRoot, 'README.kr.md'), 'utf8');

  assert.match(readme, /default source of truth is the plugin-local PAVE skill, references, commands, and role briefs/);
  assert.match(readme, /`\.claude\/agents\/` is a Claude Code adapter copy used for agent discovery/);
  assert.match(readme, /manual\/offline repo runtime install without companion checks/);
  assert.doesNotMatch(readme, /Claude Code-only manual\/offline repo runtime install/);

  assert.match(readmeKr, /기본 원본은 plugin-local PAVE skill, references, commands, role briefs/);
  assert.match(readmeKr, /`\.claude\/agents\/`는 Claude Code가 agent를 발견하기 위한 repo-local adapter copy/);
  assert.match(readmeKr, /companion check 없이 repo runtime 수동\/오프라인 설치/);
  assert.doesNotMatch(readmeKr, /Claude Code-only 수동\/오프라인 repo runtime 설치/);
});

test('Claude Code templates describe role agents as adapter copies', () => {
  const files = [
    'skills/pave/assets/repo-template/CLAUDE.md',
    'skills/pave/assets/repo-template/.codex/pave/adapters/claude-code.md',
    'skills/pave/assets/repo-template/.claude/commands/pave.md',
  ];

  for (const rel of files) {
    const content = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    assert.match(content, /shared PAVE source of truth/);
    assert.match(content, /Claude Code adapter (copy|surface)/);
  }

  const pluginCommand = fs.readFileSync(path.join(repoRoot, 'commands', 'pave.md'), 'utf8');
  assert.match(pluginCommand, /plugin-local PAVE skill and references/);
  assert.match(pluginCommand, /Claude Code adapter surface/);
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

test('Codex plugin interface defaults to plugin-only work', () => {
  const pluginPath = path.join(repoRoot, '.codex-plugin', 'plugin.json');
  const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));

  assert.equal(plugin.interface.defaultPrompt[0], 'Use PAVE for this request.');
  assert.match(plugin.interface.defaultPrompt[2], /optional PAVE runtime files/);
  assert.doesNotMatch(plugin.interface.defaultPrompt[0], /Initialize this repository/);
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

test('plugin release version is synchronized across manifests', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const codexPlugin = JSON.parse(fs.readFileSync(path.join(repoRoot, '.codex-plugin', 'plugin.json'), 'utf8'));
  const claudePlugin = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude-plugin', 'plugin.json'), 'utf8'));
  const claudeMarketplace = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude-plugin', 'marketplace.json'), 'utf8'));

  assert.equal(packageJson.version, '0.2.5');
  assert.equal(codexPlugin.version, packageJson.version);
  assert.equal(claudePlugin.version, packageJson.version);
  assert.equal(claudeMarketplace.plugins[0].version, packageJson.version);
});

test('project-init command is a dedicated initialization entrypoint', () => {
  const commandPath = path.join(repoRoot, 'commands', 'project-init.md');
  const command = fs.readFileSync(commandPath, 'utf8');

  assert.match(command, /^# \/project-init/m);
  assert.match(command, /Project Initialization/);
  assert.match(command, /optional repo-local runtime installation/);
  assert.match(command, /interview the user about product direction/);
  assert.match(command, /Interview Quality Gate/);
  assert.match(command, /Do not treat catch-all answers/);
  assert.match(command, /automation boundaries/);
  assert.doesNotMatch(command, /SNS|Instagram|DM character-chat/);
  assert.match(command, /Do not stop at copying templates/);
  assert.match(command, /Do not route this request to feature, bug, review, refactor, docs sync, continuation, or status workflows/);
  assert.match(command, /scripts\/doctor\.js <repo> --companions <profile>/);
});

test('project-init gates product direction docs on explicit user decisions', () => {
  const command = fs.readFileSync(path.join(repoRoot, 'commands', 'project-init.md'), 'utf8');
  const projectInit = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'references', 'project-init.md'), 'utf8');

  for (const content of [command, projectInit]) {
    assert.match(content, /Runtime init/);
    assert.match(content, /Direction init/);
    assert.match(content, /Before editing product direction docs/);
    assert.match(content, /Repo\s+facts,\s+existing docs,\s+inferred defaults,\s+current implementation shape,\s+and\s+common industry defaults are not substitutes for user decisions/);
    assert.match(content, /decision gap register/);
    assert.match(content, /Product actors and permissions/);
    assert.match(content, /Auth\/session model/);
    assert.match(content, /Deployment and operations model/);
    assert.match(content, /unresolved-after-asking/);
    assert.match(content, /Only record a decision as unresolved after the agent has asked the user\s+or\s+the user explicitly chose to defer that decision/);
    assert.match(content, /edits to product docs, `AGENTS\.md`, `CLAUDE\.md`, and\s+PAVE runtime policy files require approval/);
  }
});

test('README quick start explains install and optional project-init concisely', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const readmeKr = fs.readFileSync(path.join(repoRoot, 'README.kr.md'), 'utf8');

  assert.match(readme, /## Quick Start/);
  assert.match(readme, /codex plugin add superpowers@claude-plugins-official/);
  assert.match(readme, /codex plugin marketplace add TaehoHong\/pave --ref main/);
  assert.match(readme, /codex plugin add pave@pave/);
  assert.match(readme, /Plugin install does not create project files/);
  assert.match(readme, /Optional project docs: run `\/project-init`/);
  assert.match(readme, /project direction, onboarding context, and durable product decisions/);
  assert.doesNotMatch(readme, /### Plugin-only quick start/);
  assert.doesNotMatch(readme, /### Optional project initialization/);
  assert.doesNotMatch(readme, /Start from any folder where you keep tools:[\s\S]*git clone https:\/\/github\.com\/TaehoHong\/pave\.git/);
  assert.match(readme, /claude plugin marketplace add TaehoHong\/pave/);
  assert.doesNotMatch(readme, /claude plugin marketplace add TaehoHong\/pave --sparse/);
  assert.match(readme, /claude plugin install pave@pave/);
  assert.doesNotMatch(readme, /\/pave Initialize this repository with PAVE/);
  assert.match(readme, /\.\/scripts\/install\.sh <repo-path> --companions none/);

  assert.match(readmeKr, /## 빠른 시작/);
  assert.match(readmeKr, /plugin 설치만으로는 프로젝트 파일을 만들지 않습니다/);
  assert.match(readmeKr, /선택 문서화: `\/project-init`/);
  assert.match(readmeKr, /프로젝트 방향성, 온보딩 맥락, 오래 유지할 제품 결정을 저장/);
});

test('pave command and skill keep repo-local runtime files optional', () => {
  const command = fs.readFileSync(path.join(repoRoot, 'commands', 'pave.md'), 'utf8');
  const skill = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'SKILL.md'), 'utf8');

  assert.match(command, /plugin-local PAVE skill and references/);
  assert.match(command, /Feature Decision Gate/);
  assert.match(command, /feature inventory/);
  assert.match(command, /per-feature policy decisions/);
  assert.match(command, /Do not create `AGENTS\.md`, `CLAUDE\.md`, `\.codex\/pave\/`, or `docs\/`/);
  assert.match(command, /unless the user invokes `\/project-init`/);

  assert.match(skill, /PAVE runs from plugin-local instructions by default/);
  assert.match(skill, /feature inventory/);
  assert.match(skill, /per-feature policy decisions/);
  assert.match(skill, /If `\.codex\/pave\/` is missing, continue in plugin-only mode/);
  assert.match(skill, /Do not create repo-local runtime files unless the user runs `\/project-init`/);
});

test('recommended command surface is present and purpose-scoped', () => {
  const expectedCommands = {
    'doctor.md': [/Run PAVE Doctor/, /Do not edit project files/, /scripts\/doctor\.js <repo>/],
    'status.md': [/Read-only PAVE status/, /Do not edit files/, /Current branch and working tree/],
    'plan.md': [/Plan only/, /Do not edit code or tests/, /Implementation Plan/],
    'verify.md': [/Run verification only/, /Do not modify source files/, /Verification Result/],
    'sync-docs.md': [/Sync project direction docs/, /Do not invent product decisions/, /docs\/06-architecture\.md/],
  };

  for (const [file, patterns] of Object.entries(expectedCommands)) {
    const commandPath = path.join(repoRoot, 'commands', file);
    assert.equal(fs.existsSync(commandPath), true, `${file} should exist`);
    const content = fs.readFileSync(commandPath, 'utf8');
    for (const pattern of patterns) {
      assert.match(content, pattern, `${file} should include ${pattern}`);
    }
  }
});

test('PAVE command aliases are discoverable as Codex skills', () => {
  for (const command of ['project-init', 'doctor', 'status', 'plan', 'verify', 'sync-docs', 'token-save']) {
    const skillPath = path.join(repoRoot, 'skills', command, 'SKILL.md');
    assert.equal(fs.existsSync(skillPath), true, `${command} skill alias should exist`);
    const skill = fs.readFileSync(skillPath, 'utf8');

    assert.match(skill, new RegExp(`discoverable Codex entrypoint for \`\\/${command}\``));
    assert.match(skill, /\.\.\/pave\/SKILL\.md/);
    assert.match(skill, new RegExp(`\\.\\.\\/\\.\\.\\/commands\\/${command}\\.md`));
  }
});

test('README and PAVE skill list the focused command surface', () => {
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const readmeKr = fs.readFileSync(path.join(repoRoot, 'README.kr.md'), 'utf8');
  const skill = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'SKILL.md'), 'utf8');
  const plugin = JSON.parse(fs.readFileSync(path.join(repoRoot, '.codex-plugin', 'plugin.json'), 'utf8'));

  for (const command of ['/doctor', '/status', '/plan', '/verify', '/sync-docs']) {
    assert.match(readme, new RegExp(command.replace('/', '\\/')));
    assert.match(readmeKr, new RegExp(command.replace('/', '\\/')));
    assert.match(skill, new RegExp(command.replace('/', '\\/')));
  }

  assert.match(plugin.interface.longDescription, /doctor, status, plan, verify, sync-docs/);
});

test('/pave honors token-save as an optional setting', () => {
  const command = fs.readFileSync(path.join(repoRoot, 'commands', 'pave.md'), 'utf8');
  const claudeCommand = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'assets', 'repo-template', '.claude', 'commands', 'pave.md'), 'utf8');
  const tokenSave = fs.readFileSync(path.join(repoRoot, 'commands', 'token-save.md'), 'utf8');
  const config = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'assets', 'repo-template', '.codex', 'pave', 'config.md'), 'utf8');
  const readme = fs.readFileSync(path.join(repoRoot, 'README.md'), 'utf8');
  const readmeKr = fs.readFileSync(path.join(repoRoot, 'README.kr.md'), 'utf8');

  assert.match(command, /If token-save is enabled in `\.codex\/pave\/config\.md`/);
  assert.match(claudeCommand, /If token-save is enabled in `\.codex\/pave\/config\.md`/);
  assert.match(tokenSave, /prefer enabling token-save mode in `\.codex\/pave\/config\.md`/);
  assert.match(config, /Token-save: disabled/);
  assert.match(config, /Low-cost implementer: not declared/);
  assert.match(readme, /enable token-save mode in `\.codex\/pave\/config\.md`/);
  assert.match(readmeKr, /`\.codex\/pave\/config\.md`에서 token-save mode를 켜면/);
});

test('PAVE references support plugin-only planning and verification', () => {
  const planning = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'references', 'planning.md'), 'utf8');
  const verification = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'references', 'verification.md'), 'utf8');
  const projectInit = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'references', 'project-init.md'), 'utf8');

  assert.match(planning, /Keep the plan in conversation by default/);
  assert.match(planning, /write it under `\.codex\/pave\/plans\/` only when/);
  assert.match(verification, /Read declared commands from repo instructions when present/);
  assert.match(verification, /If no repo instruction declares verification commands/);
  assert.match(projectInit, /Normal feature work does not require this step/);
  assert.match(projectInit, /interview the user about product direction/);
  assert.match(projectInit, /Interview Quality Gate/);
  assert.match(projectInit, /follow-up questions until the answer is document-ready/);
  assert.match(projectInit, /feature inventory/);
  assert.match(projectInit, /per-feature policy decisions/);
  assert.match(projectInit, /primary\s+domain\s+objects/);
  assert.doesNotMatch(projectInit, /AI SNS|SNS|Instagram|DM character-chat/);
  assert.match(projectInit, /Do\s+not turn vague answers into durable project facts/);
  assert.match(projectInit, /Do not stop at copying templates/);
  assert.match(planning, /Feature Decision Gate/);
  assert.match(planning, /per-feature acceptance criteria/);
  assert.match(planning, /Do not start implementation/);
});

test('project-init docs preserve project direction and onboarding context', () => {
  const overview = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'assets', 'docs-templates', '00-overview.md'), 'utf8');
  const roadmap = fs.readFileSync(path.join(repoRoot, 'skills', 'pave', 'assets', 'docs-templates', '01-roadmap.md'), 'utf8');
  const architecturePath = path.join(repoRoot, 'skills', 'pave', 'assets', 'docs-templates', '06-architecture.md');
  const architecture = fs.readFileSync(architecturePath, 'utf8');
  const doctor = fs.readFileSync(path.join(repoRoot, 'scripts', 'doctor.js'), 'utf8');

  assert.match(overview, /Project Direction/);
  assert.match(overview, /Onboarding Summary/);
  assert.match(roadmap, /Product Principles/);
  assert.match(architecture, /^# 06\. Architecture/m);
  assert.match(architecture, /Decision Records/);
  assert.match(overview, /06-architecture\.md/);
  assert.match(doctor, /docs\/06-architecture\.md/);
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
