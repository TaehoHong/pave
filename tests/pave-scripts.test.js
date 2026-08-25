const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

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

test('init installs canonical role agents and doctor accepts the result', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-init-test-'));
  const init = run([node, 'scripts/init_repo.js', tmp]);

  assert.equal(init.status, 0, init.stderr || init.stdout);
  assert.match(init.stdout, /PAVE initialization complete/);
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

  const doctor = run([node, 'scripts/doctor.js', tmp]);
  assert.equal(doctor.status, 0, doctor.stderr || doctor.stdout);
  assert.match(doctor.stdout, /PAVE doctor passed/);
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
  assert.doesNotMatch(alias, /\.\.\/\.\.\/commands\/project-init\.md/);
  assert.match(alias, /explicit PAVE repo-local runtime and project docs initialization/);
  assert.doesNotMatch(
    reference,
    /set up AI-assisted\s+development|bootstrap a new repo/,
  );
  assert.match(command, /\$\{CLAUDE_PLUGIN_ROOT\}\/skills\/pave\/references\/project-init\.md/);
  assert.ok(command.split('\n').length <= 20, 'legacy command should stay a thin shim');
});

test('command aliases remain discoverable and purpose-scoped', () => {
  const aliases = [
    'project-init',
    'doctor',
    'status',
    'plan',
    'verify',
    'sync-docs',
    'token-save',
  ];

  for (const name of aliases) {
    assert.equal(fs.existsSync(path.join(repoRoot, 'skills', name, 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(repoRoot, 'commands', `${name}.md`)), true);
  }

  for (const name of aliases.slice(1)) {
    const skill = read(`skills/${name}/SKILL.md`);
    assert.match(skill, /\.\.\/pave\/SKILL\.md/);
    assert.match(skill, new RegExp(`\\.\\.\\/\\.\\.\\/commands\\/${name}\\.md`));
  }
});

test('plugin instruction files use resolvable script paths', () => {
  for (const instruction of [
    'skills/pave/SKILL.md',
    'skills/pave/references/project-init.md',
    'commands/doctor.md',
  ]) {
    assertPluginScriptLinksResolve(instruction);
  }
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

test('the pave command wires every workflow reference the skill routes to', () => {
  const named = (text) => new Set(
    [...text.matchAll(/references\/([a-z-]+)\.md/g)].map((match) => match[1]),
  );
  const skillReferences = named(read('skills/pave/SKILL.md'));
  const commandReferences = named(read('commands/pave.md'));

  // References the command deliberately does not name by path, because it
  // either inlines their contract as a numbered step or another command owns
  // them. Everything else the skill routes to must stay reachable from the
  // command, which is the entrypoint `/pave` actually injects.
  const inlinedByCommand = new Set([
    'request-routing',
    'fast-path',
    'testing',
    'verification',
    'reporting',
    'subagent-dispatch',
    'git',
    'project-init',
  ]);

  const unreachable = [...skillReferences]
    .filter((name) => !inlinedByCommand.has(name) && !commandReferences.has(name))
    .sort();

  assert.deepEqual(
    unreachable,
    [],
    `commands/pave.md should load these workflow references: ${unreachable.join(', ')}`,
  );

  for (const name of inlinedByCommand) {
    assert.equal(
      fs.existsSync(path.join(repoRoot, 'skills/pave/references', `${name}.md`)),
      true,
      `${name}.md is listed as inlined but does not exist`,
    );
  }
});

test('code-changing work searches for an existing owner before writing logic', () => {
  const context = read('skills/pave/references/context-retrieval.md');
  const skill = read('skills/pave/SKILL.md');
  const command = read('commands/pave.md');
  const planning = read('skills/pave/references/planning.md');
  const fastPath = read('skills/pave/references/fast-path.md');
  const review = read('skills/pave/references/review.md');

  assert.match(context, /## Existing Owner Check/);
  assert.match(context, /In\s+plugin-only mode no guide exists/);
  assert.match(context, /at least two distinct\s+signals/);
  assert.match(context, /never authorizes a\s+repository-wide read/);

  for (const [label, content] of [
    ['skill', skill],
    ['command', command],
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
  const command = read('commands/pave.md');
  const design = read('skills/pave/references/design.md');
  const planning = read('skills/pave/references/planning.md');
  const routing = read('skills/pave/references/request-routing.md');
  const planCommand = read('commands/plan.md');
  const runtimePlan = read(
    'skills/pave/assets/repo-template/.codex/pave/templates/plan.md',
  );
  const planners = [
    read('agents/planner.md'),
    read('skills/pave/references/subagents/planner.md'),
  ];

  assert.match(pave, /states an outcome without implementation-ready\s+requirements/);
  assert.match(command, /load and apply `skills\/pave\/references\/design\.md`/);
  assert.match(design, /Ask the user only when all of these are true/);
  assert.match(design, /`externally-evidenced`/);
  assert.match(design, /External facts are constraints, not user\s+preferences/);
  assert.match(design, /Do not equate all forward-looking design with scope creep/);
  assert.match(design, /evidence, current cost, avoided rework/);
  assert.match(design, /status: `active`, `superseded`, or `deferred`/);
  assert.match(design, /remaining blocking decision\s+count/);
  assert.match(design, /Read-only discovery does not require implementation approval/);
  assert.match(planning, /Agent-owned implementation details do not block readiness/);
  assert.match(routing, /partial blocker and continue\s+unblocked in-scope work/);
  assert.match(planCommand, /current decision ledger and remaining blocking decision count/);
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
    command,
    design,
    planning,
    routing,
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
  const command = read('commands/pave.md');
  const fastPath = read('skills/pave/references/fast-path.md');
  const planning = read('skills/pave/references/planning.md');
  const testing = read('skills/pave/references/testing.md');
  const verification = read('skills/pave/references/verification.md');

  assert.match(pave, /continue in plugin-only mode/);
  assert.match(pave, /Never claim completion without fresh verification evidence/);
  assert.match(command, /Do not create `AGENTS\.md`, `CLAUDE\.md`, `\.codex\/pave\/`, or `docs\/`/);
  assert.match(fastPath, /Both limits are hard eligibility conditions/);
  assert.match(fastPath, /third hand-edited file/);
  assert.match(fastPath, /original fast-path\s+request does not approve expanded scope/);
  assert.match(planning, /Read-only discovery never requires this approval/);
  assert.match(planning, /design option.+settles scope or behavior\s+only/s);
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
  const command = read('commands/pave.md');
  const debugging = read('skills/pave/references/debugging.md');
  const memory = read('skills/pave/references/memory.md');
  const reporting = read('skills/pave/references/reporting.md');
  const context = read('skills/pave/references/context-retrieval.md');
  const syncDocs = read('commands/sync-docs.md');
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
  assert.match(command, /report the Knowledge Delta/);
  assert.match(debugging, /## Investigation Ledger/);
  assert.match(debugging, /`unknown`, `probable`, or `proven`/);
  assert.match(debugging, /An unresolved investigation may be preserved only/);
  assert.match(memory, /## Promotion Gate/);
  assert.match(memory, /Never promote `agent-assumed` or `recommended-unconfirmed`/);
  assert.match(memory, /In plugin-only mode, do not create `docs\/`, `\.wiki\/`/);
  assert.match(memory, /root-cause-confidence: proven/);
  assert.match(memory, /Update or supersede an existing record/);
  assert.match(reporting, /A `Knowledge Delta`/);
  assert.match(reporting, /a `Troubleshooting Delta`/);
  assert.match(context, /docs\/troubleshooting\/_index\.md/);
  assert.match(context, /historical evidence, not proof of current\s+behavior/);
  assert.match(syncDocs, /at most 50 first-parent\s+commits/);
  assert.match(syncDocs, /A commit\s+message alone is not enough evidence/);
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
    'commands/pave.md',
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

  assert.match(read('commands/pave.md'), /design choice.+is not\s+write approval/s);
  assert.match(
    read('skills/pave/assets/repo-template/AGENTS.md'),
    /design choice or clarification answer is not write approval/i,
  );
});

test('standard approval uses host selections or pending user responses instead of commands or response markers', () => {
  const surfaces = [
    'commands/pave.md',
    'skills/pave/SKILL.md',
    'skills/pave/references/design.md',
    'skills/pave/references/planning.md',
  ];
  const retiredMarkers = /PAVE_(?:DECISIONS_RESOLVED|APPROVAL_READY|DDL_APPROVAL_READY|AWAITING_DECISION)/;

  for (const surface of surfaces) {
    assert.doesNotMatch(read(surface), retiredMarkers, surface);
  }
  assert.doesNotMatch(read('commands/pave.md'), /\$pave:pave approve|\/pave:pave approve/);
  assert.match(read('commands/pave.md'), /request_user_input/);
  assert.match(read('commands/pave.md'), /ExitPlanMode/);
  const planning = read('skills/pave/references/planning.md');
  assert.match(planning, /already in plan mode.+ExitPlanMode/s);
  assert.match(planning, /Otherwise.+AskUserQuestion/s);
  assert.doesNotMatch(planning, /prefer `ExitPlanMode`/);
  assert.match(planning, /pave_ddl_approval/);
});

test('guarded route selection is explicit and preserves investigation evidence', () => {
  const skill = read('skills/pave/SKILL.md');
  const command = read('commands/pave.md');
  const routing = read('skills/pave/references/request-routing.md');
  const fastPath = read('skills/pave/references/fast-path.md');
  const planning = read('skills/pave/references/planning.md');

  for (const [label, content] of [
    ['skill', skill],
    ['command', command],
    ['routing', routing],
  ]) {
    assert.match(content, /workflow-guard\.js[^\n]*route/s, label);
    assert.match(content, /(?:reading a (?:workflow )?reference records|reference reads are)\s+evidence/i, label);
  }
  assert.match(routing, /route reset/);
  assert.match(routing, /without losing investigation or\s+reference evidence/);
  assert.match(routing, /absolute path/);
  assert.match(routing, /Do not assume `CLAUDE_PLUGIN_ROOT` or `PLUGIN_ROOT`/);
  assert.match(skill, /not a general shell or SQL sandbox/);
  assert.match(fastPath, /Reading this reference does not select a\s+route/);
  assert.match(fastPath, /Do not restart the session/);
  assert.match(planning, /declare the `bug` or `feature` route/);
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
  const command = read('commands/pave.md');
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
  assert.match(command, /skills\/pave\/references\/design-system\.md/);
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

test('token-save remains an optional configured workflow', () => {
  assert.match(read('commands/pave.md'), /If token-save is enabled/);
  assert.match(read('commands/token-save.md'), /Implementation Contract/);
  assert.match(
    read('skills/pave/assets/repo-template/.codex/pave/config.md'),
    /Token-save: disabled/,
  );
});

test('Codex usage telemetry is discoverable, local, and phase-scoped', () => {
  const manifest = JSON.parse(read('.codex-plugin/plugin.json'));
  const hooks = JSON.parse(read('hooks/hooks.json'));
  const pave = read('skills/pave/SKILL.md');
  const usage = read('skills/usage/SKILL.md');
  const hookData = fs.mkdtempSync(path.join(os.tmpdir(), 'pave-hook-test-'));

  assert.equal(manifest.hooks, undefined);
  assert.equal(fs.existsSync(path.join(repoRoot, 'hooks', 'hooks.json')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'commands', 'usage.md')), false);
  assert.match(usage, /Codex's native `\/usage`/);
  assert.match(usage, /latest`, `daily`, `weekly`, or `cumulative`/);
  assert.match(usage, /scripts\/usage\.js` relative to this `SKILL\.md`/);
  assert.match(pave, /\[PAVE:inspect\]/);
  assert.match(pave, /\[PAVE:approval\].+in progress/s);

  assert.deepEqual(Object.keys(hooks.hooks).sort(), [
    'PostToolUse',
    'PreToolUse',
    'SessionEnd',
    'Stop',
    'UserPromptExpansion',
    'UserPromptSubmit',
  ]);
  assert.equal(hooks.hooks.PostToolUse[0].matcher, '^update_plan$');
  assert.match(hooks.hooks.PostToolUse[1].matcher, /apply_patch/);
  assert.match(hooks.hooks.PostToolUse[1].matcher, /exec_command/);
  assert.match(hooks.hooks.PostToolUse[1].matcher, /AskUserQuestion/);
  assert.match(hooks.hooks.PostToolUse[1].matcher, /ExitPlanMode/);
  assert.match(hooks.hooks.PostToolUse[1].matcher, /request_user_input/);
  assert.match(hooks.hooks.PostToolUse[1].matcher, /update_plan/);
  assert.match(hooks.hooks.PreToolUse[0].matcher, /apply_patch/);
  assert.match(hooks.hooks.PreToolUse[0].matcher, /exec_command/);

  const commands = new Set(Object.values(hooks.hooks).flatMap((event) => (
    event.flatMap((entry) => entry.hooks.map((hook) => hook.command))
  )));
  assert.equal([...commands].some((command) => /scripts\/usage\.js/.test(command)), true);
  assert.equal([...commands].some((command) => /scripts\/workflow-guard\.js/.test(command)), true);
  for (const event of ['UserPromptSubmit', 'UserPromptExpansion', 'PreToolUse', 'Stop']) {
    const eventCommands = hooks.hooks[event].flatMap((entry) => entry.hooks.map((hook) => hook.command));
    assert.equal(eventCommands.some((command) => /scripts\/workflow-guard\.js/.test(command)), true, event);
  }

  for (const command of commands) {
    assert.match(command, /\$\{CLAUDE_PLUGIN_ROOT:-\}/);
    assert.match(command, /\$\{PLUGIN_ROOT:-\}/);

    for (const hostRoot of [
      { PLUGIN_ROOT: repoRoot },
      { CLAUDE_PLUGIN_ROOT: repoRoot },
      {
        CLAUDE_PLUGIN_ROOT: path.join(hookData, 'stale-plugin'),
        PLUGIN_ROOT: repoRoot,
      },
    ]) {
      const result = run(['/bin/sh', '-c', command], {
        input: '{}\n',
        env: {
          PATH: process.env.PATH,
          CLAUDE_PLUGIN_DATA: hookData,
          ...hostRoot,
        },
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stdout, '{}\n');
    }

    for (const missingRoot of [
      {},
      { PLUGIN_ROOT: path.join(hookData, 'missing-plugin') },
    ]) {
      const result = run(['/bin/sh', '-c', command], {
        input: '{}\n',
        env: {
          PATH: process.env.PATH,
          PLUGIN_DATA: hookData,
          ...missingRoot,
        },
      });
      assert.equal(result.status, 0, result.stderr);
    }
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
