const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { collectFiles } = require('../scripts/init_repo.js');

const repoRoot = path.resolve(__dirname, '..');
const node = process.execPath;
const roles = [
  'product-manager',
  'planner',
  'ui-ux-designer',
  'fullstack-developer',
  'qa-engineer',
];

function read(rel) {
  return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
}

function run(args, options = {}) {
  return spawnSync(args[0], args.slice(1), {
    cwd: repoRoot,
    encoding: 'utf8',
    ...options,
  });
}

function assertPluginScriptLinksResolve(rel) {
  const links = [
    ...read(rel).matchAll(/`((?:\.\.\/)*scripts\/[A-Za-z0-9_.-]+)(?:\s[^`]*)?`/g),
  ];

  assert.ok(links.length > 0, `${rel} should declare at least one plugin script`);
  for (const [, target] of links) {
    assert.equal(
      fs.existsSync(path.resolve(repoRoot, path.dirname(rel), target)),
      true,
      `${rel}: ${target} should resolve from the declaring file`,
    );
  }
}

function assertTreeInstalled(srcRoot, dstRoot) {
  for (const sourceFile of collectFiles(srcRoot)) {
    const relativePath = path.relative(srcRoot, sourceFile);
    const installedFile = path.join(dstRoot, relativePath);
    assert.equal(
      fs.existsSync(installedFile) && fs.statSync(installedFile).isFile(),
      true,
      `${relativePath} should be installed`,
    );
  }
}

test('init installs and validates the complete runtime', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-init-test-'));
  const init = run([node, 'scripts/init_repo.js', tmp]);

  assert.equal(init.status, 0, init.stderr || init.stdout);
  assert.match(init.stdout, /PAVE initialization complete and validated/);
  assert.equal(fs.existsSync(path.join(tmp, 'docs', '06-architecture.md')), true);
  assert.equal(fs.existsSync(path.join(tmp, 'docs', '07-codebase-guide.md')), true);
  assert.equal(fs.existsSync(path.join(tmp, 'docs', 'troubleshooting')), false);

  for (const role of roles) {
    assert.equal(
      fs.readFileSync(path.join(tmp, '.claude', 'agents', `${role}.md`), 'utf8'),
      read(`agents/${role}.md`),
    );
    assert.equal(
      fs.existsSync(path.join(
        repoRoot,
        'skills/pave/assets/repo-template/.claude/agents',
        `${role}.md`,
      )),
      false,
    );
  }

  assertTreeInstalled(path.join(repoRoot, 'skills/pave/assets/repo-template'), tmp);
  assertTreeInstalled(path.join(repoRoot, 'agents'), path.join(tmp, '.claude', 'agents'));
  assertTreeInstalled(path.join(repoRoot, 'skills/pave/assets/docs-templates'), path.join(tmp, 'docs'));
});

test('marketplace manifests expose one synchronized plugin', () => {
  const packageJson = JSON.parse(read('package.json'));
  const codexPlugin = JSON.parse(read('.codex-plugin/plugin.json'));
  const codexMarketplace = JSON.parse(read('.agents/plugins/marketplace.json'));
  const claudePlugin = JSON.parse(read('.claude-plugin/plugin.json'));
  const claudeMarketplace = JSON.parse(read('.claude-plugin/marketplace.json'));

  assert.deepEqual(codexMarketplace.plugins[0].source, {
    source: 'local',
    path: './plugins/pave',
  });
  assert.equal(fs.readlinkSync(path.join(repoRoot, 'plugins', 'pave')), '..');
  assert.equal(codexPlugin.skills, './skills/');
  assert.doesNotMatch(codexPlugin.interface.defaultPrompt[0], /Initialize/i);
  assert.equal(codexPlugin.author.name, 'TaehoHong');
  assert.equal(codexPlugin.homepage, 'https://github.com/TaehoHong/pave');
  assert.equal(codexPlugin.repository, 'https://github.com/TaehoHong/pave');
  assert.equal(codexPlugin.license, 'MIT');
  assert.ok(codexPlugin.interface.defaultPrompt.length <= 3);
  assert.equal(claudePlugin.author.name, 'TaehoHong');
  assert.equal(claudePlugin.repository, 'https://github.com/TaehoHong/pave');
  assert.equal(claudePlugin.license, 'MIT');
  assert.equal(fs.existsSync(path.join(repoRoot, 'LICENSE')), true);

  assert.equal(claudeMarketplace.plugins[0].source, './plugins/pave');
  assert.equal(fs.existsSync(path.join(repoRoot, 'commands', 'pave.md')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'agents', 'planner.md')), true);

  for (const version of [
    codexPlugin.version,
    claudePlugin.version,
    claudeMarketplace.plugins[0].version,
  ]) {
    assert.equal(version, packageJson.version);
  }
});

test('project-init uses one canonical workflow reference', () => {
  const reference = read('skills/pave/references/project-init.md');
  const alias = read('skills/project-init/SKILL.md');
  const command = read('commands/project-init.md');

  for (const pattern of [
    /Runtime init/,
    /Direction init/,
    /explicit user decisions for every required project-level decision/,
    /decision gap register/,
    /Project Design Gate/,
    /deferred-to-feature-planning/,
    /scope and ownership map, not a feature specification/,
    /standard PAVE\s+feature workflow[\s\S]+feature-level product review[\s\S]+program design, vertical slicing/,
    /require approval/,
    /must stop after project initialization/,
  ]) {
    assert.match(reference, pattern);
  }

  assert.doesNotMatch(
    reference,
    /For each feature, record the\s+actor, trigger, happy path, edge cases/,
  );
  assert.match(alias, /\.\.\/pave\/references\/project-init\.md/);
  assert.doesNotMatch(alias, /\.\.\/pave\/SKILL\.md/);
  assert.doesNotMatch(alias, /\.\.\/\.\.\/commands\/project-init\.md/);
  assert.match(alias, /explicit PAVE repo-local runtime and project docs initialization/);
  assert.match(reference, /root and nested `AGENTS\.md`/);
  assert.match(reference, /`\.codex\/ai-dev-harness\/` exists[\s\S]+legacy-compatible/);
  assert.doesNotMatch(
    reference,
    /set up AI-assisted\s+development|bootstrap a new repo/,
  );
  assert.match(command, /\$\{CLAUDE_PLUGIN_ROOT\}\/skills\/pave\/references\/project-init\.md/);
  assert.doesNotMatch(command, /skills\/pave\/SKILL\.md/);
  assert.ok(command.split('\n').length <= 20, 'legacy command should stay a thin shim');
});

test('command aliases remain discoverable and purpose-scoped', () => {
  const aliases = [
    'project-init',
    'status',
    'plan',
    'sync-docs',
  ];

  for (const name of aliases) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'skills', name, 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(repoRoot, 'commands', `${name}.md`)), true);
  }

  const statusSkill = read('skills/status/SKILL.md');
  const statusCommand = read('commands/status.md');

  assert.match(statusSkill, /\$pave:status/);
  assert.doesNotMatch(statusSkill, /\.\.\/pave\/SKILL\.md/);
  assert.match(statusSkill, /\.\.\/\.\.\/commands\/status\.md/);
  assert.match(statusCommand, /read at most one plan and one report/i);
  assert.match(
    statusCommand,
    /do not scan source files or validate the guide's recorded evidence paths/i,
  );

  const planSkill = read('skills/plan/SKILL.md');
  const planCommand = read('commands/plan.md');

  assert.match(planSkill, /\$pave:plan/);
  assert.doesNotMatch(planSkill, /\.\.\/pave\/SKILL\.md/);
  assert.match(planSkill, /references\/planning\.md/);
  assert.match(planSkill, /references\/testing\.md/);
  assert.match(planSkill, /also read `\.\.\/pave\/references\/design\.md`/);
  for (const reference of ['planning', 'testing', 'design']) {
    assert.match(
      planCommand,
      new RegExp(`\\$\\{CLAUDE_PLUGIN_ROOT\\}/skills/pave/references/${reference}\\.md`),
    );
  }
  assert.ok(
    planCommand.trimEnd().split('\n').length <= 30,
    'plan command should stay a thin router',
  );

  const syncDocsSkill = read('skills/sync-docs/SKILL.md');
  const syncDocsCommand = read('commands/sync-docs.md');

  assert.match(syncDocsSkill, /\$pave:sync-docs/);
  assert.doesNotMatch(syncDocsSkill, /\.\.\/pave\/SKILL\.md/);
  for (const reference of ['memory', 'verification', 'context-retrieval', 'history-backfill', 'git']) {
    assert.match(syncDocsSkill, new RegExp(`references/${reference}\\.md`));
    assert.match(
      syncDocsCommand,
      new RegExp(`\\$\\{CLAUDE_PLUGIN_ROOT\\}/skills/pave/references/${reference}\\.md`),
    );
  }
  assert.doesNotMatch(syncDocsCommand, /docs\/00-overview\.md/);
  assert.match(syncDocsCommand, /Do not read every\s+PAVE project document by default/);
  assert.match(
    syncDocsCommand,
    /Git\s+range only when history\s+or troubleshooting backfill was requested/,
  );

  for (const name of ['doctor', 'verify']) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'skills', name, 'SKILL.md')), false);
    assert.equal(fs.existsSync(path.join(repoRoot, 'commands', `${name}.md`)), false);
  }
});

test('project-init uses resolvable script paths', () => {
  assertPluginScriptLinksResolve('skills/pave/references/project-init.md');
});

test('workflow references do not chain to sibling workflow references', () => {
  const referencesDir = path.join(repoRoot, 'skills/pave/references');
  const workflowReferences = fs.readdirSync(referencesDir)
    .filter((name) => name.endsWith('.md'));

  for (const source of workflowReferences) {
    const content = read(`skills/pave/references/${source}`);
    const chainedReferences = [
      ...content.matchAll(/`([^`\s]+\.md)`/g),
    ].map((match) => path.basename(match[1]))
      .filter((target) => target !== source && workflowReferences.includes(target));

    assert.deepEqual(
      chainedReferences,
      [],
      `${source} should not require another workflow reference`,
    );
  }
});

test('the pave command is a thin shim to the canonical skill', () => {
  const command = read('commands/pave.md');

  assert.match(command, /\$\{CLAUDE_PLUGIN_ROOT\}\/skills\/pave\/SKILL\.md/);
  assert.match(command, /\$ARGUMENTS/);
  assert.match(command, /Request Routing/);
  assert.match(command, /canonical PAVE workflow/);
  assert.ok(command.split('\n').length <= 24, 'pave command should stay a thin shim');
  assert.doesNotMatch(command, /## Command Behavior|## Decision and Approval Contract/);
});

test('the main skill owns routing and scopes completion reporting', () => {
  const pave = read('skills/pave/SKILL.md');
  const reporting = read('skills/pave/references/reporting.md');

  assert.equal(
    fs.existsSync(path.join(repoRoot, 'skills/pave/references/request-routing.md')),
    false,
  );
  assert.match(pave, /Status request: read `\.\.\/\.\.\/commands\/status\.md`/);
  assert.match(pave, /Bug: read `references\/debugging\.md`/);
  assert.match(pave, /Plugin installation or local development: read `\.\.\/\.\.\/README\.md`/);
  assert.doesNotMatch(pave, /references\/request-routing\.md/);
  assert.doesNotMatch(pave, /## Scripts|## Commands/);
  assert.match(pave, /only for a mutating completion or a task blocked/);
  assert.match(pave, /Read-only analysis, review, status, plan-only/);
  assert.match(reporting, /Do not load it for read-only analysis, review, status/);
  assert.match(reporting, /Plan path, when a durable plan exists/);
});

test('code-changing work searches for an existing owner before writing logic', () => {
  const context = read('skills/pave/references/context-retrieval.md');
  const skill = read('skills/pave/SKILL.md');
  const planning = read('skills/pave/references/planning.md');
  const fastPath = read('skills/pave/references/fast-path.md');
  const review = read('skills/pave/references/review.md');

  assert.match(context, /## Existing Owner Check/);
  assert.match(context, /In\s+plugin-only mode no guide exists/);
  assert.match(context, /at least two distinct\s+signals/);
  assert.match(context, /never authorizes a\s+repository-wide read/);

  for (const [label, content] of [
    ['skill', skill],
    ['planning', planning],
    ['fast-path', fastPath],
    ['review', review],
  ]) {
    assert.match(content, /Existing Owner\s+Check/, label);
  }

  for (const [label, content] of [
    ['context-retrieval', context],
    ['skill', skill],
    ['planning', planning],
    ['fast-path', fastPath],
  ]) {
    for (const outcome of ['owner-found', 'owner-absent', 'owner-rejected']) {
      assert.match(content, new RegExp(`\`${outcome}\``), `${label}: ${outcome}`);
    }
  }

  assert.match(fastPath, /`owner-rejected`[\s\S]{0,80}ends fast-path\s+eligibility/);
  assert.match(review, /unexplained duplicate as a\s+major finding/);
});

test('outcome-only feature requests triage material decisions and bound interviews', () => {
  const pave = read('skills/pave/SKILL.md');
  const design = read('skills/pave/references/design.md');
  const planning = read('skills/pave/references/planning.md');
  const planCommand = read('commands/plan.md');
  const runtimePlan = read(
    'skills/pave/assets/repo-template/.codex/pave/templates/plan.md',
  );
  const planners = [
    read('agents/planner.md'),
    read('skills/pave/references/subagents/planner.md'),
  ];

  assert.match(pave, /states an outcome without implementation-ready\s+requirements/);
  assert.match(design, /Ask the user only when all of these are true/);
  assert.match(design, /`externally-evidenced`/);
  assert.match(design, /External facts are constraints, not user\s+preferences/);
  assert.match(design, /Do not equate all forward-looking design with scope creep/);
  assert.match(design, /evidence, current cost, avoided rework/);
  assert.match(design, /status: `active`, `superseded`, or `deferred`/);
  assert.match(design, /remaining blocking decision\s+count/);
  assert.match(design, /Read-only discovery needs no implementation approval/);
  assert.match(planning, /Agent-owned implementation details do not block readiness/);
  assert.match(pave, /continue safe unblocked work/);
  assert.match(runtimePlan, /Extension boundaries: <evidence, current cost, avoided rework>/);
  assert.match(runtimePlan, /externally-evidenced/);
  assert.match(runtimePlan, /active, superseded, or deferred/);

  for (const planner of planners) {
    assert.match(planner, /Ask only material user-owned questions/);
    assert.match(planner, /remaining blocking decision count/);
    assert.doesNotMatch(
      planner,
      /ask the user about every behavior-changing|every unknown or `recommended-unconfirmed`/i,
    );
  }

  for (const entrypoint of [
    pave,
    design,
    planning,
    planCommand,
    read('skills/pave/assets/repo-template/AGENTS.md'),
    read('skills/pave/assets/repo-template/.claude/commands/pave.md'),
    read('skills/pave/assets/repo-template/.codex/pave/config.md'),
    read('skills/pave/assets/repo-template/.codex/pave/adapters/generic-agent.md'),
  ]) {
    assert.doesNotMatch(
      entrypoint,
      /ask every product|ask every product or policy|including small details/i,
    );
  }
});

test('plugin-only workflows preserve safety and verification contracts', () => {
  const pave = read('skills/pave/SKILL.md');
  const fastPath = read('skills/pave/references/fast-path.md');
  const planning = read('skills/pave/references/planning.md');
  const testing = read('skills/pave/references/testing.md');
  const verification = read('skills/pave/references/verification.md');

  assert.match(pave, /continue in plugin-only mode/);
  assert.match(pave, /Never claim completion without fresh verification evidence/);
  assert.match(pave, /Do not create repo-local runtime files unless/);
  assert.match(fastPath, /Both limits are hard eligibility conditions/);
  assert.match(fastPath, /third hand-edited file/);
  assert.match(fastPath, /original fast-path request as\s+approval for expanded scope/);
  const approval = read('skills/pave/references/approval.md');
  assert.match(approval, /Scope intent authorizes read-only discovery but\s+not writes/);
  assert.match(approval, /Selecting a design option.+settles scope or behavior only/s);
  assert.match(pave, /speed,\s+terseness, or implementation size do not waive those gates/);
  assert.match(testing, /realistic defect/);
  assert.match(testing, /machine-consumed or explicitly supported public interface/);
  assert.match(verification, /run that\s+command fresh/);
});

test('code work reuses a freshness-checked durable codebase guide', () => {
  const pave = read('skills/pave/SKILL.md');
  const context = read('skills/pave/references/context-retrieval.md');
  const guide = read('skills/pave/assets/docs-templates/07-codebase-guide.md');
  const projectInit = read('skills/pave/references/project-init.md');
  const syncDocs = read('commands/sync-docs.md');
  const runtimeAgent = read('skills/pave/assets/repo-template/AGENTS.md');

  assert.match(pave, /read `docs\/07-codebase-guide\.md` when present/);
  assert.match(context, /Do not begin with a repository-wide source read/);
  assert.match(context, /git log -1 --format=%H -- docs\/07-codebase-guide\.md/);
  assert.match(context, /git diff --cached --name-only -- <evidence-paths>/);
  assert.match(context, /direct callers and callees/);
  assert.match(context, /Update the affected guide entries in the same work/);
  assert.match(guide, /Shared Capability Catalog/);
  assert.match(guide, /Code Conventions and Canonical Examples/);
  assert.match(guide, /Evidence paths/);
  assert.match(projectInit, /Populate `docs\/07-codebase-guide\.md` from code evidence/);
  assert.match(syncDocs, /Do not rewrite unrelated\s+entries/);
  assert.match(runtimeAgent, /Expand the search only when ownership is missing/);
});

test('verified troubleshooting is promoted as scoped durable project knowledge', () => {
  const pave = read('skills/pave/SKILL.md');
  const debugging = read('skills/pave/references/debugging.md');
  const memory = read('skills/pave/references/memory.md');
  const reporting = read('skills/pave/references/reporting.md');
  const context = read('skills/pave/references/context-retrieval.md');
  const historyBackfill = read('skills/pave/references/history-backfill.md');
  const runtimeAgent = read('skills/pave/assets/repo-template/AGENTS.md');
  const runtimeCommand = read(
    'skills/pave/assets/repo-template/.claude/commands/pave.md',
  );
  const genericAdapter = read(
    'skills/pave/assets/repo-template/.codex/pave/adapters/generic-agent.md',
  );
  const indexTemplate = read('skills/pave/assets/troubleshooting/index.md');
  const recordTemplate = read('skills/pave/assets/troubleshooting/record.md');

  assert.match(pave, /For implementation, bug, refactor, and documentation-sync work/);
  assert.match(pave, /Bug:[\s\S]+references\/memory\.md/);
  assert.match(pave, /report the resulting\s+Knowledge Delta/);
  assert.match(debugging, /## Investigation Ledger/);
  assert.match(debugging, /`unknown`, `probable`, or `proven`/);
  assert.match(debugging, /An unresolved investigation may be preserved only/);
  assert.match(memory, /## Promotion Gate/);
  assert.match(memory, /Never promote `agent-assumed` or `recommended-unconfirmed`/);
  assert.match(memory, /In plugin-only mode, do not create `docs\/`, `\.wiki\/`/);
  assert.match(memory, /root-cause-confidence: proven/);
  assert.match(memory, /Update or supersede an existing record/);
  assert.match(reporting, /`Knowledge Delta`:/);
  assert.match(reporting, /a `Troubleshooting Delta`/);
  assert.match(context, /docs\/troubleshooting\/_index\.md/);
  assert.match(context, /historical evidence, not proof of current\s+behavior/);
  assert.match(historyBackfill, /at most 50 first-parent\s+commits/);
  assert.match(historyBackfill, /A commit\s+message alone is not enough evidence/);
  assert.match(indexTemplate, /Follow `superseded-by` links/);
  assert.match(recordTemplate, /root-cause-confidence: proven/);
  assert.match(recordTemplate, /## Regression Guard and Verification/);

  for (const entrypoint of [runtimeAgent, runtimeCommand, genericAdapter]) {
    assert.match(entrypoint, /docs\/troubleshooting\//, entrypoint);
    assert.match(entrypoint, /Knowledge Delta/, entrypoint);
  }
});

test('every fast-path entrypoint preserves the hard size and approval gates', () => {
  const entrypoints = [
    'skills/pave/references/fast-path.md',
    'skills/pave/assets/repo-template/AGENTS.md',
    'skills/pave/assets/repo-template/.claude/commands/pave.md',
    'skills/pave/assets/repo-template/.codex/pave/config.md',
    'skills/pave/assets/repo-template/.codex/pave/adapters/generic-agent.md',
  ];

  for (const entrypoint of entrypoints) {
    const content = read(entrypoint);
    assert.match(content, /two (?:hand-edited files|files)/, entrypoint);
    assert.match(content, /twenty\s+substantive\s+(?:hand-edited lines|lines)/, entrypoint);
    assert.doesNotMatch(content, /\bnormally\b|\broughly\b/, entrypoint);
  }

  assert.match(
    read('skills/pave/assets/repo-template/AGENTS.md'),
    /design choice or clarification answer is not write approval/i,
  );
});

test('standard approval uses host selections or pending user responses instead of commands or response markers', () => {
  const routedSurfaces = [
    'skills/pave/SKILL.md',
    'skills/pave/references/design.md',
    'skills/pave/references/planning.md',
  ];
  const approval = read('skills/pave/references/approval.md');
  const retiredMarkers = /PAVE_(?:DECISIONS_RESOLVED|APPROVAL_READY|DDL_APPROVAL_READY|AWAITING_DECISION)/;

  for (const surface of [...routedSurfaces, 'skills/pave/references/approval.md']) {
    assert.doesNotMatch(read(surface), retiredMarkers, surface);
  }
  assert.doesNotMatch(approval, /\$pave:pave approve|\/pave:pave approve/);
  assert.match(approval, /already in plan mode.+ExitPlanMode/s);
  assert.match(approval, /Otherwise.+AskUserQuestion/s);
  assert.doesNotMatch(approval, /prefer `ExitPlanMode`/);
  assert.match(approval, /pave_implementation_approval/);
  assert.match(approval, /pave_ddl_approval/);

  assert.match(read('skills/pave/SKILL.md'), /references\/approval\.md/);
  for (const surface of routedSurfaces) {
    const content = read(surface);
    assert.doesNotMatch(
      content,
      /request_user_input|AskUserQuestion|ExitPlanMode|pave_(?:implementation|ddl)_approval/,
      surface,
    );
  }
});

test('PAVE separates workflow evidence from host execution enforcement', () => {
  const skill = read('skills/pave/SKILL.md');
  const approval = read('skills/pave/references/approval.md');
  const review = read('skills/pave/references/review.md');
  const verification = read('skills/pave/references/verification.md');

  assert.equal(
    fs.existsSync(path.join(repoRoot, 'scripts', 'workflow-guard.js')),
    false,
  );
  for (const surface of [skill, approval, review, verification]) {
    assert.doesNotMatch(
      surface,
      /workflow-guard|route reset|boundary --verify|PAVE_BLOCKED|PreToolUse/,
    );
  }

  assert.match(approval, /## Implementation Contract/);
  assert.match(approval, /expected changed files and external operations/);
  assert.match(approval, /host permissions and\s+sandboxing govern tool execution/i);
  assert.match(approval, /Obtain renewed approval before acting/);
  assert.match(review, /actual changed-file list and diff/);
  assert.match(verification, /fresh evidence for every acceptance\s+criterion/);
});

test('project-init links existing documentation instead of duplicating it', () => {
  const reference = read('skills/pave/references/project-init.md');
  const command = read('commands/project-init.md');
  const skill = read('skills/project-init/SKILL.md');

  assert.match(reference, /## Existing Documentation Discovery/);
  assert.match(reference, /Keep the discovered document canonical/);
  assert.match(reference, /Never create a parallel duplicate tree silently/);
  assert.match(reference, /### Interview Reduction/);
  assert.match(reference, /link that root from `docs\/`, or adopt it as the docs location/);
  assert.match(command, /link each PAVE doc to the existing document that owns its\s+subject/);
  assert.match(skill, /source of truth instead of duplicating it/);

  const templatesDir = 'skills/pave/assets/docs-templates';
  const templates = fs.readdirSync(path.join(repoRoot, templatesDir));
  assert.equal(templates.length, 8);
  for (const template of templates) {
    assert.match(read(`${templatesDir}/${template}`), /## Linked Sources/, template);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-existing-docs-test-'));
  fs.mkdirSync(path.join(tmp, 'documentation'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'apps', 'web', 'design'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'postmortems'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'node_modules', 'pkg', 'doc'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'README.md'), '# existing\n');
  fs.writeFileSync(path.join(tmp, 'node_modules', 'pkg', 'README.md'), '# vendor\n');

  const init = run([node, 'scripts/init_repo.js', tmp]);

  assert.equal(init.status, 0, init.stderr || init.stdout);
  assert.match(init.stdout, /existing documentation detected: documentation$/m);
  assert.match(init.stdout, /existing documentation detected: README\.md$/m);
  assert.match(init.stdout, /existing documentation detected: apps\/web\/design$/m);
  assert.match(init.stdout, /existing documentation detected: postmortems$/m);
  assert.doesNotMatch(init.stdout, /node_modules/);
  assert.match(init.stdout, /link these from docs\/ instead of duplicating them\./);
});

test('user-visible work follows the resolved design system', () => {
  const designSystem = read('skills/pave/references/design-system.md');
  const pave = read('skills/pave/SKILL.md');
  const design = read('skills/pave/references/design.md');
  const review = read('skills/pave/references/review.md');
  const fastPath = read('skills/pave/references/fast-path.md');
  const designRules = read('skills/pave/assets/docs-templates/04-design-rules.md');

  assert.match(designSystem, /Resolve the design system in this order/);
  assert.match(designSystem, /docs\/04-design-rules\.md/);
  assert.match(designSystem, /Reuse an existing component before creating a new one/);
  assert.match(designSystem, /Do not hardcode a literal value that an\s+existing token already covers/);
  assert.match(designSystem, /deviation from the resolved design system is a material user-owned\s+decision/);
  assert.match(designSystem, /do not start a second parallel system/);

  assert.match(pave, /references\/design-system\.md/);
  assert.match(design, /resolve the project's design system/);
  assert.match(review, /check design-system\s+compliance/);
  assert.match(fastPath, /Needing a new component, token, or variant/);
  assert.match(designRules, /## Design System/);
  assert.match(designRules, /Deviation policy/);

  for (const entrypoint of [
    'skills/pave/assets/repo-template/AGENTS.md',
    'skills/pave/assets/repo-template/.claude/commands/pave.md',
    'skills/pave/assets/repo-template/.codex/pave/config.md',
    'skills/pave/assets/repo-template/.codex/pave/adapters/generic-agent.md',
  ]) {
    const content = read(entrypoint);
    assert.match(content, /design system/i, entrypoint);
    assert.match(content, /docs\/04-design-rules\.md/, entrypoint);
    assert.match(content, /deviation[^.]{0,40}user-owned decision/i, entrypoint);
  }

  for (const role of ['ui-ux-designer', 'fullstack-developer']) {
    for (const brief of [
      read(`agents/${role}.md`),
      read(`skills/pave/references/subagents/${role}.md`),
    ]) {
      assert.match(brief, /design-system deviation/i, role);
      assert.match(brief, /tokens/, role);
    }
  }
});

test('the core plugin installs no token-save workflow', () => {
  for (const removedPath of [
    'commands/token-save.md',
    'skills/token-save/SKILL.md',
  ]) {
    assert.equal(fs.existsSync(path.join(repoRoot, removedPath)), false, removedPath);
  }

  for (const surface of [
    'skills/pave/SKILL.md',
    'skills/pave/assets/repo-template/.codex/pave/config.md',
    'skills/pave/assets/repo-template/.claude/commands/pave.md',
    'README.md',
    'README.kr.md',
    'BENCHMARKING.md',
  ]) {
    assert.doesNotMatch(read(surface), /token-save|low-cost implementer/i, surface);
  }
});

test('the core plugin installs no passive usage telemetry', () => {
  for (const removedPath of [
    'hooks/hooks.json',
    'scripts/usage.js',
    'skills/usage/SKILL.md',
    'tests/usage.test.js',
  ]) {
    assert.equal(fs.existsSync(path.join(repoRoot, removedPath)), false, removedPath);
  }

  for (const surface of [
    'skills/pave/SKILL.md',
    'README.md',
    'README.kr.md',
    'BENCHMARKING.md',
  ]) {
    assert.doesNotMatch(
      read(surface),
      /PAVE_USAGE|pave:usage|scripts\/usage\.js|\[PAVE:/,
      surface,
    );
  }
});

test('install dry-run never installs the plugin', () => {
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
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    },
  });

  assert.equal(install.status, 0, install.stderr || install.stdout);
  assert.equal(fs.existsSync(log), false);
  assert.match(install.stdout, /would create repo directory/);
});
