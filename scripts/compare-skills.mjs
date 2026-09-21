#!/usr/bin/env node
// What do the SKILLS contribute, as opposed to the connector?
//
// The runner's built-in baseline removes the whole plugin — and the plugin is what declares the MCP server — so its
// delta measures the package. To measure the guidance alone, run the same suite twice with the tools held constant:
// once as shipped, once with `skills/` moved aside so only the MCP configuration remains.
//
//   node scripts/compare-skills.mjs --model <model> [--runs 3]

import { execFileSync } from 'node:child_process';
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PLUGIN = join(ROOT, 'plugins/freightright');

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const model = flag('model');
const runs = flag('runs', '3');
if (!model) {
  console.error('usage: node scripts/compare-skills.mjs --model <model> [--runs 3]');
  process.exit(2);
}

const evaluate = (dir, label) => {
  const out = join(mkdtempSync(join(tmpdir(), 'fr-cmp-')), `${label}.json`);
  console.log(`\n── ${label} ─────────────────────────────────────────────`);
  execFileSync('claude', [
    'plugin', 'eval', dir, '--model', model, '--runs', runs,
    '--ablation', 'none', '--mocks', 'record', '--no-publish', '--trust-plugin', '--json', out,
  ], { stdio: 'inherit' });
  return JSON.parse(readFileSync(out, 'utf8'));
};

// Skills off: identical mocks, identical MCP configuration, no guidance.
const without = mkdtempSync(join(tmpdir(), 'fr-noskills-'));
cpSync(PLUGIN, join(without, 'freightright'), { recursive: true });
rmSync(join(without, 'freightright/skills'), { recursive: true, force: true });

const on = evaluate(PLUGIN, 'skills-on');
const off = evaluate(join(without, 'freightright'), 'skills-off');
rmSync(without, { recursive: true, force: true });

const score = (report, name) => report.cases?.find((c) => c.name === name)?.aggregates?.score;
const names = [...new Set([...(on.cases ?? []).map((c) => c.name), ...(off.cases ?? []).map((c) => c.name)])].sort();

console.log('\n\nSkills contribution — same tools, same fixtures, in both arms\n');
console.log(`${'CASE'.padEnd(40)} ${'ON'.padStart(5)} ${'OFF'.padStart(6)} ${'Δ'.padStart(7)}`);
let sum = 0;
let counted = 0;
for (const name of names) {
  const a = score(on, name);
  const b = score(off, name);
  const d = typeof a === 'number' && typeof b === 'number' ? a - b : null;
  if (d !== null) { sum += d; counted += 1; }
  console.log(
    `${name.padEnd(40)} ${(a ?? '-').toString().padStart(5)} ${(b ?? '-').toString().padStart(6)} ` +
    `${d === null ? '-' : (d >= 0 ? '+' : '') + d.toFixed(2)}`.padStart(8)
  );
}
console.log(`\nmean Δ attributable to the skills: ${counted ? (sum / counted >= 0 ? '+' : '') + (sum / counted).toFixed(3) : 'n/a'}`);
console.log(`model ${model}, ${runs} trials per arm, ${counted} cases compared`);
