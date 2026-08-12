# PAVE Benchmarking Methodology

## Status

This document defines how to measure PAVE's behavioral effects and operating
costs. It is an evaluation contract, not evidence that PAVE is effective.

The repository currently has two narrower forms of evidence:

- `tests/*.test.js` checks plugin structure, workflow wiring, and local usage
  accounting;
- `scripts/usage.js` records phase duration and token deltas when the host
  exposes compatible usage events.

Those checks can prove that instructions and instrumentation are present. They
cannot prove that an agent follows the workflow, produces a better patch, or is
worth its additional cost. Behavioral claims require the controlled evaluations
defined below.

## Evaluation Principles

1. **Measure outcomes, not declarations.** An agent saying that it investigated,
   planned, or verified something is not evidence that it did so correctly.
2. **Use paired controls.** Run the same task from the same repository state with
   and without the PAVE condition under test.
3. **Keep quality and cost separate.** Do not hide regressions or overhead in one
   composite score.
4. **Pre-register decisions.** Freeze tasks, rubrics, metrics, exclusions, and
   acceptance thresholds before viewing treatment results.
5. **Use hidden oracles.** Agents must not receive the evaluator's expected
   owner, root cause, tests, decision labels, or forbidden implementation paths.
6. **Repeat stochastic runs.** One successful or failed trajectory is an
   anecdote, not a benchmark result.
7. **Validate the evaluator.** Every automated rubric must reject a known-bad
   mutation and accept a known-good solution before it scores agents.
8. **Report uncertainty and failures.** Publish per-task results, distributions,
   confidence intervals, exclusions, and missing telemetry.

## Claims and Comparison Conditions

Every reported result must identify the exact claim and comparison. At minimum,
maintain these conditions:

| Condition | Purpose |
| --- | --- |
| Bare host agent | Estimates the effect of adding PAVE to the same agent. |
| Current PAVE | Measures the released workflow as users receive it. |
| Previous stable PAVE | Detects behavioral and cost regressions between releases. |
| Targeted ablation | Attributes an effect to one gate or workflow without claiming that the whole system caused it. |

The bare-host and PAVE conditions must use the same host, model, reasoning
effort, permissions, tool availability, task prompt, starting commit, and
resource limits. A model or host comparison is a separate experiment.

An ablation removes only the instruction or mechanism being studied. It must
not silently remove unrelated context, hooks, commands, or verification tools.
For example, an Existing Owner Check ablation keeps the rest of PAVE intact.

## Evaluation Layers

PAVE should be evaluated at four distinct layers.

### 1. Contract conformance

Static checks answer whether manifests, commands, skills, references, and hooks
are valid and reachable. The existing repository tests primarily cover this
layer. Conformance is necessary but is not a behavioral result.

### 2. Trajectory behavior

Trajectory checks answer whether the agent performed the required investigation,
asked appropriate questions, respected approval boundaries, used a current
owner, ran meaningful verification, and corrected major review findings.

### 3. Artifact and outcome quality

Outcome checks evaluate the final patch and repository state with hidden tests,
structural assertions, policy oracles, diff review, and human judgment. These
are the primary effectiveness measures.

### 4. Operating cost

Cost checks measure tokens, elapsed time, model calls, tool use, user burden,
context volume, diff size, and review effort. Cost must be reported for failed
and successful runs.

## Task Suite

Use both controlled fixtures and real repository tasks. No single task family
represents PAVE as a whole.

| Task family | PAVE behavior under test | Primary outcome measures |
| --- | --- | --- |
| Small, clear edits | Fast-path classification and proportional process | Task success, unnecessary questions, latency, tokens |
| Existing shared behavior | Context retrieval and Existing Owner Check | Correct-owner reuse, duplicate-rule rate, false reuse |
| Bugs with plausible alternatives | Investigation Ledger and root-cause discipline | Proven-cause rate, premature-fix rate, regression protection |
| Outcome-only features | Decision triage and feature readiness | Requirement coverage, decision precision/recall, rework |
| Approval-sensitive changes | Scope and write-approval boundaries | Unauthorized-write rate, approval turns, blocked progress |
| Tests and verification | Test Value Gate and fresh verification | Valuable-test rate, mutation kill rate, false completion claims |
| UI and UX changes | Design-system resolution and reuse | Component/token reuse, accessibility, unjustified deviations |
| Cross-layer implementation | Vertical slicing and execution loop | End-to-end success, partial scaffolding, scope expansion |
| Review and repair | Diff review and major-finding correction | Defects found, defects fixed, false-positive review findings |
| Read-only requests | Plan, review, status, and verification routing | Analysis accuracy, unauthorized writes, unnecessary work |
| Runtime lifecycle | Project initialization, sync, and doctor behavior | Idempotency, preservation, diagnosis accuracy, repo pollution |
| Delegated work | Bounded specialist dispatch and integration | End-to-end success, conflicting edits, context and coordination cost |
| Cost-saving mode | Token-save routing and bounded implementation | Quality retention, token and latency reduction, escalation accuracy |
| Durable knowledge | Memory promotion and documentation routing | Promotion precision/recall, stale or duplicate documentation |
| Safety and compatibility | Risk recognition and preservation | Critical violations, destructive actions, compatibility regressions |
| Long-context work | Selective retrieval and context control | Success by context size, irrelevant reads, premature termination |

Each family should include positive and negative controls. For example, owner
tasks need all three cases: a suitable owner exists, no owner exists, and a
similar-looking owner is unsuitable. Otherwise the benchmark rewards agents
that always reuse or always create new code.

### Suite tiers

1. **Synthetic fixtures:** small repositories with unambiguous hidden oracles;
   cheap enough for frequent regression runs.
2. **Historical replay:** sanitized real tasks reconstructed from commits,
   incidents, and accepted reviews; preserves realistic coupling.
3. **Shadow evaluation:** run on current internal tasks without applying the
   candidate patch; compare recommendations and diffs offline.
4. **Production observation:** aggregate accepted changes, review findings,
   rework, and costs only after offline safety and quality gates pass.

Synthetic fixtures establish causality and evaluator reliability. Historical
and shadow tasks establish external validity. Production data alone cannot
separate PAVE effects from task, model, developer, or repository differences.

## External Benchmarks and Industry Frameworks

External benchmarks provide independent task definitions, executable graders,
and comparison points. They complement rather than replace PAVE's controlled
fixtures: most public coding benchmarks score only the final artifact and do
not directly observe approval discipline, owner reuse, unnecessary questions,
or knowledge promotion.

The following selection reflects public primary sources available on
2026-08-12. Pin the dataset, runner, container image, and evaluator revision for
every reported result because benchmark contents and grading code can change.

### Recommended benchmark portfolio

| Priority | Benchmark or framework | Evidence it adds | Recommended PAVE use | Important limitation |
| --- | --- | --- | --- | --- |
| Core | [FeatureBench](https://github.com/LiberCoders/FeatureBench) | Complex feature implementation in existing repositories | Compare bare host and PAVE on the same model with the Lite or 100-instance Fast split before attempting the full suite | Primarily scores executable outcomes; add PAVE trajectory graders for workflow claims |
| Core | [SWT-Bench Verified](https://swtbench.com/) | Issue-reproducing test generation and changed-line coverage | Test the Test Value Gate using reproduction success, invalid-test rate, and coverage increase | Covers test generation for bug reports, not general implementation quality |
| Core, production | [DORA software delivery performance](https://dora.dev/guides/dora-metrics/) | Delivery throughput and instability over time | Measure change lead time, deployment frequency, failed deployment recovery time, change fail rate, and deployment rework rate for the same service before and after rollout | Observational metrics do not establish PAVE causality without a controlled rollout |
| Core, production | [EngThrive](https://www.microsoft.com/en-us/research/publication/engthrive-make-it-fast-and-easy-to-do-great-work/) | Speed, ease, quality, and developer thriving | Combine system telemetry with a repeated developer survey as a guardrail against local speed gains that increase burden | Requires stable survey design and enough users and time for useful inference |
| Pilot | [Harness-Bench](https://www.harness-bench.ai/) | Model-harness effects across outcome, process, usage, and failure behavior | Adapt its software-engineering, workspace, and long-running tasks to compare PAVE on and off while preserving native host execution | New benchmark with limited implementation history; validate its graders and build host adapters before using it as a release gate |
| Periodic | [SWE-Lancer Diamond](https://openai.com/index/swe-lancer/) | Real freelance tasks with monetary values and end-to-end tests | Estimate value resolved, API cost per dollar of resolved work, and review-adjusted economic return on periodic larger runs | Economic labels are historical payouts, not guaranteed business value for a PAVE user |
| Secondary | [Terminal-Bench 2.0](https://github.com/harbor-framework/terminal-bench-2) | Reliable terminal work in containerized environments | Stress tool use, environment recovery, security tasks, and harness observability; use Harbor when a common runner is useful | Broad terminal work is not a direct test of PAVE's development workflow |
| Rotating | [SWE-rebench V2](https://github.com/SWE-rebench/SWE-rebench-V2) | Large, multilingual, reproducible repository tasks with task-quality metadata | Draw fresh or language-stratified issue-resolution samples to check contamination and ecosystem generality | Automated collection and LLM-assisted filtering still require local gold and evaluator audits |

FeatureBench is the first external suite to operationalize. Its official runner
supports Codex and Claude Code, offers reproducible Docker evaluation, and has a
100-instance Fast split that needs no GPU. Use the smaller split to validate
the PAVE adapter and accounting before purchasing full-suite inference.

SWT-Bench is the targeted test-quality suite. A successful generated test must
fail on the original buggy state and pass after the resolving patch without
introducing failures on the fixed state. Report both issue reproduction success
and coverage increase; neither a created test file nor raw test count is a
valid substitute.

Harness-Bench is conceptually the closest external benchmark because it treats
context, tools, state, constraints, permissions, tracing, and recovery as part
of the evaluated harness. Its public suite contains 106 offline sandboxed tasks,
including software-engineering and long-running state-adaptation categories,
and records artifacts, traces, usage, and validator output. Its current
adapters must be extended and audited for PAVE's supported hosts, so treat it as
a diagnostic pilot rather than the only release decision.

### Standard integration contract

Every external benchmark run must still follow the paired protocol in this
document:

1. Pin the benchmark commit, dataset split, container digest, task list, and
   official evaluator version.
2. Validate a stratified sample with gold, empty, known-bad, and alternative
   valid patches before paying for model runs.
3. Add a native host adapter that preserves Codex or Claude Code behavior. Do
   not replace the host with another scaffold and label the result a PAVE
   comparison.
4. Run the identical host, model, effort, prompt, permissions, budget, timeout,
   and starting environment with PAVE off and on.
5. Capture official outcome scores plus PAVE's common token, time, tool, user
   interaction, review, and failure fields.
6. Keep official benchmark scores separate from PAVE-specific trajectory
   scores. Report task-level paired effects and confidence intervals rather
   than comparing unrelated public leaderboard entries.
7. Publish evaluator exclusions and rerun both conditions after any benchmark
   task or grading fix.

Use [Harbor](https://github.com/harbor-framework/harbor) as shared execution
infrastructure only when its adapter can preserve the native host and the PAVE
condition. A convenient runner is not evidence that two harness configurations
were held equal.

### Production effectiveness and ROI

External task suites establish reproducible capability evidence; production
telemetry establishes whether that capability improves real delivery. Use a
staggered or randomized rollout where feasible, compare the same repositories
or services over time, and stratify by task type and risk. Do not compare raw
metrics across unrelated teams or applications.

Map production evidence to these layers:

| Layer | Primary measures |
| --- | --- |
| Delivery outcome | DORA's five delivery throughput and instability metrics |
| Developer outcome | EngThrive speed, ease, quality, and thriving measures |
| PAVE behavior | Approval violations, correct-owner reuse, valuable tests, fresh verification, review findings, and rework |
| Direct cost | API and license cost, infrastructure, training, support, evaluator operation, and human review time |
| Economic value | Developer capacity reinvested, additional accepted features, avoided rework and incidents, downtime impact, and value resolved in SWE-Lancer-style tasks |

The [DORA AI ROI calculator](https://dora.dev/ai/roi/calculator/) can seed an
explicit cost model, including tooling and training cost, adoption-related
productivity loss, developer time saved, feature value, and downtime impact.
Treat its output as a high-uncertainty scenario estimate. Replace assumptions
with locally observed values and publish the sensitivity range rather than one
precise ROI number.

### Benchmarks not suitable as primary release gates

Do not use SWE-bench Verified as PAVE's headline effectiveness measure. OpenAI's
2026 review concluded that design and contamination issues prevented it from
providing meaningful signal for frontier software-development capability.

Do not use the public SWE-Bench Pro score as a hard release gate without a local
task audit. In its 2026 [evaluation-quality audit](https://openai.com/index/separating-signal-from-noise-coding-evaluations/),
OpenAI estimated that about 30% of tasks were broken, citing overly restrictive
tests, underspecified or misleading prompts, and insufficient test coverage.
An audited subset may be reported as secondary compatibility evidence, with the
accepted and excluded task IDs and reasons published.

Likewise, no leaderboard result obtained with a different model, scaffold,
prompt, budget, or evaluator is a control for PAVE. It is background context,
not a measured PAVE effect.

## Task Specification

Store each task as versioned data. A task record should contain at least:

```yaml
id: owner-existing-auth-policy
family: existing-shared-behavior
repository: fixture-auth-service
start_commit: <immutable commit>
prompt_file: prompt.md
interaction_script: evaluator/user-script.yaml
time_limit_seconds: 900
tool_call_limit: 100

oracle:
  acceptance_commands:
    - npm test
  hidden_tests:
    - evaluator/hidden/auth-policy.test.js
  expected_behavior:
    - expired sessions are rejected by every login entry point
  expected_owner:
    - src/auth/policy.ts
  forbidden_patterns:
    - duplicate expiry comparison in src/routes/login.ts
  material_user_decisions: []
  approval_boundaries:
    - no source write before implementation approval
  allowed_scope:
    - src/auth/**
    - src/routes/login.ts
    - tests/**

rubric:
  functional_success: automated
  owner_selection: automated-plus-blind-review
  scope_control: automated
  maintainability: blind-review
```

Keep prompt data separate from hidden evaluator data. The task author must
record why each oracle distinguishes a correct solution from a realistic broken
one. Reject tasks whose expected solution depends on undocumented stylistic
preference or only one exact patch.

Interactive tasks use a frozen user script. The simulator gives the same answer
to semantically equivalent questions in every condition, grants approval only
at the declared boundary, and does not volunteer hidden decisions that the
agent failed to surface. Human improvisation during a paired run invalidates
the pair unless it was pre-registered as the subject of the experiment.

## Effectiveness Metrics

Report raw counts and rates per task family. Use the task, not an individual
run, as the primary unit when aggregating repeated runs.

### Core outcome metrics

- **Task success rate:** fraction of runs satisfying all required functional,
  structural, safety, and scope gates.
- **Hidden-test pass rate:** fraction passing tests unavailable to the agent.
- **Requirement coverage:** required observable behaviors satisfied divided by
  total required behaviors.
- **Scope precision:** necessary changed files or behaviors divided by all
  changed files or behaviors. Report unrequested behavior separately.
- **Regression rate:** fraction that breaks declared preservation checks.
- **Critical violation rate:** destructive, security, privacy, data-integrity,
  permission, or public-communication violations. Never average these away.
- **False completion rate:** fraction claiming success without passing the
  declared fresh verification or while a hidden critical defect remains.

### Workflow-specific metrics

- **Decision precision:** material questions divided by all questions asked.
- **Decision recall:** material user-owned decisions surfaced divided by all
  material user-owned decisions in the hidden oracle.
- **Unnecessary-question rate:** runs that ask for discoverable technical facts
  or repeat an already settled decision.
- **Unauthorized-write rate:** runs that edit before the applicable approval or
  exceed an approved boundary without renewed approval.
- **Correct-owner reuse rate:** tasks with a suitable owner where the final
  implementation extends or calls that owner.
- **False-owner reuse rate:** tasks without a suitable owner where the agent
  forces reuse and damages the boundary.
- **Duplicate-rule rate:** runs that create an independent implementation of a
  rule already owned elsewhere.
- **Proven-root-cause rate:** bug runs whose stated cause is distinguished from
  plausible alternatives by diagnostic evidence.
- **Premature-fix rate:** bug runs that edit before evidence identifies the
  failing mechanism.
- **Valuable-test rate:** added tests that fail on a known-bad mutation, pass on
  the correct implementation, and survive behavior-preserving refactoring.
- **Mutation kill rate:** seeded realistic defects detected by the submitted
  tests divided by seeded defects applicable to the task.
- **Design-system compliance:** applicable UI requirements satisfied for
  canonical components, tokens, variants, states, accessibility, and
  breakpoints.
- **Knowledge promotion precision:** durable entries that are verified,
  reusable, and routed to the canonical owner divided by all promoted entries.
- **Knowledge promotion recall:** benchmark-designated durable facts correctly
  promoted divided by all designated durable facts.

For every rate, define the eligible denominator in the task rubric. If the
denominator is zero, report `not_applicable` rather than zero or one. Aggregate
repetitions within each task before averaging across tasks, and publish both the
macro result and eligible raw counts. Timeouts, crashes, and refusals remain
failures unless the pre-registered oracle says that stopping was the safe and
correct outcome.

### Human review metric

Use a blinded rubric for qualities that are expensive or unreliable to encode,
such as maintainability, architectural fit, and whether a question was truly
material. Reviewers must not know the condition, model, or run identifier.
Normalize condition-revealing metadata when it is not part of the behavior
being scored, randomize patch order, and measure inter-rater agreement. Resolve
disagreement by a pre-declared adjudication process, not by the benchmark owner
alone.

## Cost Metrics

Measure cost over the entire run, including failed attempts and final reporting.

- total input, cached-input, output, reasoning, and combined tokens;
- wall-clock duration and active agent duration;
- duration and tokens by PAVE phase when available;
- model/API cost using the price table frozen for the experiment date;
- model calls and tool calls by type;
- files opened, unique files opened, bytes or tokens read, and repository search
  calls;
- context compactions, resumptions, retries, and failed commands;
- user interaction turns, approval waits, and clarification latency;
- changed files, substantive changed lines, and total diff size;
- automated verification duration;
- blinded human review and correction time.

`scripts/usage.js` is the canonical source for PAVE's current Codex phase token
and duration data. A benchmark runner may collect additional trajectory and
artifact metrics, but raw prompts, responses, private source, credentials, and
transcripts must remain local and must not be copied into published results.
Missing usage events remain `unavailable`; do not estimate them.

### Quality-adjusted cost

Always publish quality and cost independently. These secondary measures help
interpret the trade-off:

```text
relative token overhead = (tokens_pave - tokens_control) / tokens_control
relative time overhead  = (time_pave - time_control) / time_control

incremental cost per additional success =
  (mean_cost_pave - mean_cost_control) /
  (success_rate_pave - success_rate_control)
```

Do not compute incremental cost per success when the success-rate difference is
zero or negative. A composite utility score may be reported only as a secondary
analysis with weights chosen before the run and with every component also shown
separately.

## Experimental Protocol

### Freeze the experiment

Record the following before execution:

- PAVE commit or package version and the exact control or ablation;
- host agent version, model identifier, reasoning effort, temperature or seed
  controls when available, permissions, and enabled tools;
- task-suite revision and immutable starting commits;
- time, token, model-call, and tool-call budgets;
- dependency lockfiles, runtime versions, platform, and relevant environment;
- primary metrics, acceptance thresholds, exclusion rules, and analysis code;
- API price snapshot for cost calculations.

### Run paired trials

1. Restore the task repository to its immutable starting state.
2. Create a fresh isolated checkout for one condition and one repetition.
3. Install only the assigned PAVE/control condition.
4. Ensure repository instructions and host configuration are identical except
   for the treatment being measured. A control must not inherit PAVE through a
   global plugin, cached skill, generated runtime file, or previous session.
5. Clear condition-specific conversational state and prevent artifacts from a
   previous run from leaking into the next run.
6. Execute the exact task prompt and frozen interaction script under the frozen
   resource limits.
7. Capture usage events, timing, tool metadata, final diff, exit status, and
   verification evidence.
8. Stop the agent before running hidden evaluators.
9. Run hidden tests, structural checks, mutation checks, and blind review.
10. Preserve a redacted result record and discard or restrict raw sensitive data
   according to the repository's data policy.

Randomize condition order within each task. When provider caching or rate limits
can bias results, interleave conditions and record cache/rate-limit events.

### Repetitions and sample size

Use at least three repetitions per condition for a pilot and at least five for
a release claim. Determine the number of tasks with a power analysis based on
the smallest effect worth detecting. When no prior variance estimate exists,
start with this sequence:

```text
evaluator pilot:  8 tasks × 2 conditions × 3 repetitions = 48 runs
release pilot:   20 tasks × 2 conditions × 5 repetitions = 200 runs
```

Expand task families, models, or hosts only after the evaluator pilot proves
that the oracles detect known failures. More repeated runs do not compensate
for a narrow or unrepresentative task suite. A benchmark may support only the
claims represented by its tasks; an eight-task pilot cannot establish that the
entire PAVE workflow is effective.

## Evaluator Validation

Before scoring agents, validate each task with controlled artifacts:

1. **Gold patch:** must pass all applicable evaluators.
2. **Known-bad patch:** must fail the specific metric it is designed to test.
3. **Empty patch:** must not pass an implementation task.
4. **Shortcut patch:** passes obvious public tests but violates a hidden
   structural, scope, safety, or preservation requirement.
5. **Alternative valid patch:** should pass when it meets behavior and boundary
   requirements without matching the gold diff.

For tests created to evaluate PAVE's Test Value Gate, run mutation analysis.
For textual workflow classifiers, use labeled positive and negative trajectories
and publish precision, recall, and error examples. Do not use an LLM judge as
the sole evaluator for critical correctness or safety.

## Statistical Analysis

- Use paired task-level differences because every condition sees the same task.
- Report mean, median, standard deviation, and p50/p90 for continuous costs.
- Report absolute percentage-point differences for binary quality rates.
- Use task-clustered bootstrap 95% confidence intervals so repeated runs do not
  masquerade as independent tasks.
- Use McNemar-style paired analysis for binary outcomes and paired permutation
  or signed-rank analysis for skewed continuous outcomes when appropriate.
- For multiple models, hosts, repositories, or task families, use a hierarchical
  model or report stratified effects; do not pool away important interactions.
- Correct or clearly label exploratory multiple comparisons.
- Publish failures and timeouts as outcomes under the pre-registered policy.

A result is inconclusive when its confidence interval includes both no effect
and the pre-registered minimum useful effect. Do not rewrite this as a win.

## Release Decision Gates

Set thresholds before running the benchmark. A release candidate should satisfy
all of the following forms of gate:

1. **Safety floor:** no increase in critical violations; ideally zero in both
   conditions.
2. **Quality floor:** no material regression in task success or preservation
   checks for any critical task family.
3. **Claim evidence:** at least one primary outcome directly improves for every
   advertised behavioral claim.
4. **Cost ceiling:** token, time, user-turn, and review overhead stay below the
   pre-registered acceptable limits.
5. **Cross-condition stability:** the benefit is not entirely explained by one
   task, repository, model, or evaluator.

Example thresholds may be used for an initial pilot, but they are not universal
PAVE policy:

```text
task success:              no worse than control by more than 5 percentage points
targeted defect rate:      at least 20% relative reduction
critical violations:      no increase
median token overhead:     at most 20%
median wall-time overhead: at most 25%
unnecessary user turns:    no increase
```

Replace these examples with thresholds justified by user value, task risk, and
operating cost before making a release claim.

## Reporting Template

Every benchmark report should include:

- hypothesis and exact conditions;
- PAVE, host, model, suite, evaluator, and environment versions;
- pre-registered primary metrics and decision gates;
- task-family composition and excluded tasks;
- per-task raw outcomes in a machine-readable table;
- aggregate effects with confidence intervals;
- token, time, user-interaction, and review costs;
- critical failures and representative false positives/negatives;
- ablation results when making a component-level claim;
- threats to validity and unresolved telemetry gaps;
- release decision: pass, fail, or inconclusive.

Suggested result fields:

```text
run_id, task_id, task_family, condition, repetition,
host_version, model, effort, pave_version,
success, hidden_tests_passed, regression, critical_violation,
owner_outcome, duplicate_rule, valuable_tests, false_completion,
questions_total, questions_material, unauthorized_write,
input_tokens, cached_input_tokens, output_tokens, reasoning_tokens,
wall_time_ms, tool_calls, unique_files_read, changed_files, changed_lines,
review_minutes, evaluator_version, exclusion_reason
```

Published data must use opaque run identifiers and sanitized fixture names when
repository or user identity is sensitive.

## Benchmark Maintenance

- Version tasks, oracles, runners, and reports independently from PAVE.
- Keep a held-out set that is not used while editing prompts or workflow rules.
- Rotate or extend tasks when agents may have memorized fixtures.
- Re-run gold, known-bad, shortcut, and alternative-valid artifacts after every
  evaluator change.
- Review score drift when host agents, models, pricing, or tool behavior change.
- Never delete unfavorable historical results; supersede them with a linked
  report explaining what changed.
- Separate benchmark fixes from PAVE behavior changes when possible so a result
  is attributable to one axis.

## Minimum Implementation Sequence

1. Create eight synthetic tasks spanning fast path, owner reuse, debugging,
   decisions, test value, verification, UI reuse, and safety.
2. Add gold, known-bad, empty, shortcut, and alternative-valid artifacts.
3. Build a local runner that creates clean checkouts, executes assigned
   conditions, and records redacted result rows.
4. Reuse `scripts/usage.js` output for phase cost and add only the missing
   benchmark-specific counters.
5. Run the 48-run evaluator pilot and fix unreliable oracles.
6. Freeze thresholds, expand to at least twenty tasks, and run the release
   pilot.
7. Add historical replay and shadow tasks before claiming real-world impact.

Until these steps produce paired behavioral results, PAVE should describe its
workflow contracts and measured local usage, but should not claim proven gains
in agent correctness, maintainability, safety, or productivity.
