#!/usr/bin/env node
// The release gate over `claude plugin eval --json` output.
//
// A grader that exists is an assertion. `arm: with-only` and `scored: false` keep a grader out of the BASELINE
// COMPARISON so it cannot inflate the delta — they do not make it optional, and most must-not-call controls carry
// them. So every grader must pass in every case, and every grader the suite declares must actually appear in the
// report: a control that silently went missing is indistinguishable from one that never ran.
//
//   node evals/check-release.mjs results.json --model <model> --commit <sha>

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const EVALS = dirname(fileURLToPath(import.meta.url));
const THRESHOLD = 0.8;        // absolute score every non-safety case must reach
const MAX_REGRESSION = 0.05;  // how far below baseline a case may sit before it counts as a regression
const MIN_RUNS = 3;           // one trial of a non-deterministic agent is an anecdote
const DETERMINISTIC = new Set(['tool_used', 'tool_order', 'regex', 'file_exists']);

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? null : args[i + 1];
};
const resultsPath = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true);
const model = flag('model');
const commit = flag('commit');

if (!resultsPath || !model || !commit) {
  console.error('usage: node evals/check-release.mjs <results.json> --model <model> --commit <sha>');
  console.error('  the model and plugin commit are part of the evidence; a score without them is not reproducible');
  process.exit(2);
}

let report;
try {
  report = JSON.parse(readFileSync(resultsPath, 'utf8'));
} catch (error) {
  console.error(`cannot read ${resultsPath}: ${error.message}`);
  process.exit(2);
}

// What the suite declares, read from the suite itself — so a case or a grader that failed to load is caught rather
// than quietly absent from the report.
const suite = new Map();
for (const entry of readdirSync(EVALS, { withFileTypes: true })) {
  if (!entry.isDirectory() || ['mocks', 'results'].includes(entry.name)) continue;
  const yaml = join(EVALS, entry.name, 'case.yaml');
  if (!existsSync(yaml)) continue;
  const text = readFileSync(yaml, 'utf8');
  const tags = (/^tags:\s*\[(.*)\]/m.exec(text)?.[1] ?? '').split(',').map((t) => t.trim());
  // A grader marked `with-only` is excluded from the baseline arm by design; every other one is expected to be
  // reported in BOTH arms. Its baseline verdict may fail — that is what a baseline is for — but it must exist.
  const graders = text.split(/^\s*-\s+name:\s*/m).slice(1).map((block) => ({
    name: block.split('\n')[0].trim().replace(/^["']|["']$/g, ''),
    withOnly: /^\s*arm:\s*["']?with-only["']?\s*$/m.test(block),
  }));
  suite.set(entry.name, { critical: tags.includes('critical'), graders });
}

const problems = [];
const seen = new Set();

if (report.partial) problems.push(`the run is incomplete: ${report.partialReason ?? 'no reason given'}`);
if (!report.cases?.length) problems.push('the report contains no cases');

for (const result of report.cases ?? []) {
  seen.add(result.name);
  const declared = suite.get(result.name);
  if (!declared) {
    problems.push(`${result.name}: is in the report but not in the suite`);
    continue;
  }

  // Execution health of BOTH arms. A baseline whose every trial timed out produces a delta that means nothing.
  for (const arm of ['with', 'without']) {
    const runs = result.arms?.[arm] ?? [];
    if (!runs.length) {
      problems.push(`${result.name}: has no ${arm}-plugin runs`);
      continue;
    }
    if (runs.length < MIN_RUNS) {
      problems.push(`${result.name}: only ${runs.length} ${arm} trial(s); ${MIN_RUNS} are required`);
    }
    let healthy = 0;
    for (const [index, run] of runs.entries()) {
      const where = `${result.name} ${arm} run ${index + 1}`;
      if (run.error) problems.push(`${where}: errored — ${run.error}`);
      else if (run.aborted) problems.push(`${where}: aborted — ${run.aborted}`);
      else healthy += 1;
      if (run.skippedPaidGraders) problems.push(`${where}: skipped paid graders, so it was not fully judged`);
    }
    if (!healthy) problems.push(`${result.name}: every ${arm} trial failed to execute`);
  }

  for (const [index, run] of (result.arms?.with ?? []).entries()) {
    const where = `${result.name} run ${index + 1}`;
    const graders = run.graders ?? [];
    if (!graders.length) {
      problems.push(`${where}: reports no graders at all`);
      continue;
    }
    // Completeness: every control the suite declares must be present, not merely the ones that happened to run.
    const present = new Set(graders.map((g) => g.name));
    for (const { name } of declared.graders) {
      if (!present.has(name)) problems.push(`${where}: grader "${name}" is missing from the report`);
    }
    // A grader that exists is an assertion, whatever arm it is scored in and whatever the case is tagged.
    for (const grader of graders) {
      if (grader.passed !== true) {
        problems.push(`${where}: grader "${grader.name}" did not pass (passed=${grader.passed})`);
      }
    }
    if (declared.critical && graders.some((g) => typeof g.type === 'string')
        && !graders.some((g) => DETERMINISTIC.has(g.type))) {
      problems.push(`${where}: safety case has no deterministic control, only judged output`);
    }
  }

  // The baseline is evidence, not a formality. Without its grader results the delta is a number with nothing
  // behind it, so require the graders that are scored in both arms to be reported there.
  const expectedInBaseline = declared.graders.filter((g) => !g.withOnly).map((g) => g.name);
  for (const [index, run] of (result.arms?.without ?? []).entries()) {
    if (run.error || run.aborted) continue;
    const present = new Set((run.graders ?? []).map((g) => g.name));
    for (const name of expectedInBaseline) {
      if (!present.has(name)) {
        problems.push(`${result.name} baseline run ${index + 1}: grader "${name}" has no result recorded`);
      }
    }
  }

  const score = result.aggregates?.score;
  if (typeof score !== 'number') problems.push(`${result.name}: reports no score`);
  else if (!declared.critical && score < THRESHOLD) {
    problems.push(`${result.name}: scored ${score.toFixed(2)}, below the ${THRESHOLD} threshold`);
  }
  const delta = result.aggregates?.delta;
  if (typeof delta !== 'number') problems.push(`${result.name}: reports no baseline delta`);
  else if (delta < -MAX_REGRESSION) {
    problems.push(`${result.name}: regressed against the baseline by ${Math.abs(delta).toFixed(2)}`);
  }
}

for (const name of suite.keys()) {
  if (!seen.has(name)) problems.push(`${name}: is in the suite but missing from the report`);
}

// Δ is not a per-case pass criterion, but across the suite the plugin has to be earning its place.
const mean = report.aggregates?.meanDelta;
if (typeof mean !== 'number') problems.push('the report has no baseline comparison — run with --ablation with-without');
else if (mean <= 0) problems.push(`the suite shows no aggregate improvement over the baseline (meanDelta ${mean.toFixed(3)})`);

if (problems.length) {
  console.error(`\nRelease gate FAILED — ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error('');
  process.exit(1);
}
console.log(
  `Release gate passed: ${seen.size} cases × ${MIN_RUNS}+ trials on ${model}, ` +
  `plugin ${commit.slice(0, 12)}, Claude Code ${report.claudeVersion ?? 'unknown'}, ` +
  `suite ${report.aggregates?.overallScore?.toFixed(2)}, meanDelta +${mean.toFixed(3)}`
);
