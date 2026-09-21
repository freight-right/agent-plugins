#!/usr/bin/env node
// Proves the checks actually bite. A validator nobody has seen fail is a validator nobody knows works — every case
// here was a real false pass at some point, so each one stays as a regression.

import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const edit = (dir, file, fn) => {
  const p = join(dir, file);
  writeFileSync(p, fn(readFileSync(p, 'utf8')));
};
const json = (dir, file, fn) => {
  const p = join(dir, file);
  const v = JSON.parse(readFileSync(p, 'utf8'));
  writeFileSync(p, JSON.stringify(fn(v) ?? v, null, 2) + '\n');
};

const CASE = 'plugins/freightright/evals/never-books-without-the-customer/case.yaml';
const SKILL = 'plugins/freightright/skills/instant-pricing/SKILL.md';

const VALIDATOR_CASES = [
  ['a grader naming a tool that does not exist', (d) =>
    edit(d, CASE, (s) => s.replace('freightright_prepare_instant_booking"', 'freightright_nonexistent_tool"'))],
  ['a tool reference without the scoped prefix', (d) =>
    edit(d, CASE, (s) => s.replace('mcp__plugin_freightright_freightright__freightright_prepare_instant_booking',
      'freightright_prepare_instant_booking'))],
  ['a regex grader given min/max, which fails to load at run time', (d) =>
    edit(d, 'plugins/freightright/evals/arrivals-this-week/case.yaml', (s) => `${s}    min: 0\n    max: 0\n`)],
  ['a skill whose name does not match its directory', (d) =>
    edit(d, SKILL, (s) => s.replace('name: instant-pricing', 'name: something-else'))],
  ['a skill carrying allowed-tools', (d) =>
    edit(d, SKILL, (s) => s.replace('name: instant-pricing', 'name: instant-pricing\nallowed-tools: Bash'))],
  ['a connector URL that is not production', (d) =>
    json(d, 'plugins/freightright/.mcp.json', (v) => {
      v.mcpServers.freightright.url = 'https://dev-mcp.sm.freightright.com/mcp';
    })],
  ['a client manifest drifting from the others', (d) =>
    json(d, '.cursor-plugin/marketplace.json', (v) => { v.metadata.version = '9.9.9'; })],
  ['a tool with no mock, which would make a must-not-call check vacuous', (d) =>
    rmSync(join(d, 'plugins/freightright/evals/mocks/freightright/freightright_get_shipment.md'))],
];

let failures = 0;
const check = (what, run) => {
  const dir = mkdtempSync(join(tmpdir(), 'fr-selftest-'));
  try {
    cpSync(ROOT, dir, { recursive: true, filter: (s) => !s.includes('/.git/') && !s.includes('node_modules') });
    run(dir);
    try {
      execFileSync('node', [join(dir, 'scripts/validate.mjs')], { stdio: 'pipe' });
      console.error(`  ✗ NOT CAUGHT: ${what}`);
      failures += 1;
    } catch {
      console.log(`  ✓ caught: ${what}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

console.log('validator:');
for (const [what, mutate] of VALIDATOR_CASES) check(what, mutate);

// The release gate: reports that once passed while proving nothing.
console.log('release gate:');
const evals = join(ROOT, 'plugins/freightright/evals');
const names = readdirSync(evals, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !['mocks', 'results'].includes(e.name))
  .map((e) => e.name);
const report = (graders) => ({
  schemaVersion: 1, partial: false, claudeVersion: 'test',
  aggregates: { overallScore: 1, casesPassed: names.length, casesTotal: names.length, meanDelta: 0.5 },
  cases: names.map((name) => ({
    name, aggregates: { score: 1, delta: 0.5 },
    arms: { with: [{ graders, error: null, aborted: null }], without: [{ graders, error: null, aborted: null }] },
  })),
});
const GATE_CASES = [
  ['a safety control that failed but was excluded from scoring',
    report([{ name: 'no-prepare-instant-booking', type: 'tool_used', scored: false, passed: false }])],
  ['a report carrying no grader evidence at all', report([])],
  ['a safety case judged only by a rubric, with no deterministic control',
    report([{ name: 'answer', type: 'llm', scored: true, passed: true }])],
];
for (const [what, body] of GATE_CASES) {
  const file = join(mkdtempSync(join(tmpdir(), 'fr-report-')), 'report.json');
  writeFileSync(file, JSON.stringify(body));
  try {
    execFileSync('node', [join(evals, 'check-release.mjs'), file], { stdio: 'pipe' });
    console.error(`  ✗ NOT CAUGHT: ${what}`);
    failures += 1;
  } catch {
    console.log(`  ✓ caught: ${what}`);
  }
}

if (failures) {
  console.error(`\n${failures} check(s) did not bite.\n`);
  process.exit(1);
}
console.log(`\nAll ${VALIDATOR_CASES.length + GATE_CASES.length} checks bite.`);
