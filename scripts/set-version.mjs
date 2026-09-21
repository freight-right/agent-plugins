#!/usr/bin/env node
// One version lives in eight files. Bumping them by hand is how a release goes out inconsistent, so this is the
// only supported way to do it.
//
//   npm run set-version -- 0.2.0

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PLUGIN = 'plugins/freightright';

const [, , version] = process.argv;
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  console.error('usage: npm run set-version -- <major.minor.patch>');
  process.exit(2);
}

// [file, how that file states the version]
const TARGETS = [
  ['package.json', (v) => { v.version = version; }],
  [`${PLUGIN}/plugin.json`, (v) => { v.version = version; }],
  [`${PLUGIN}/.claude-plugin/plugin.json`, (v) => { v.version = version; }],
  [`${PLUGIN}/.cursor-plugin/plugin.json`, (v) => { v.version = version; }],
  [`${PLUGIN}/.codex-plugin/plugin.json`, (v) => { v.version = version; }],
  ['.claude-plugin/marketplace.json', (v) => { v.version = version; }],
  ['.github/plugin/marketplace.json', (v) => { v.version = version; }],
  ['.cursor-plugin/marketplace.json', (v) => { v.metadata.version = version; }],
];

for (const [file, set] of TARGETS) {
  const path = join(ROOT, file);
  const value = JSON.parse(readFileSync(path, 'utf8'));
  set(value);
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
  console.log(`  ${file}`);
}
console.log(`\nSet ${TARGETS.length} files to ${version}. Run \`npm test\`, then update CHANGELOG.md.`);
