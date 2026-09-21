#!/usr/bin/env node
// Repository invariants that `claude plugin validate` cannot see: that the manifests agree, that every tool a skill
// names really exists on the connector, that no skill has drifted outside the portable Agent Skills fields, and that
// nothing here points at a development environment.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PLUGIN = 'plugins/freightright';
const CONNECTOR_URL = 'https://mcp.freightright.com/mcp';
const SERVER_KEY = 'freightright';
const PORTABLE_FIELDS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const SHARED_MANIFEST_FIELDS = [
  'name', 'displayName', 'version', 'description', 'homepage', 'repository', 'license', 'mcpServers',
];

const problems = [];
const fail = (where, message) => problems.push(`${where}: ${message}`);
const read = (path) => readFileSync(join(ROOT, path), 'utf8');

function walk(dir, out = []) {
  if (!existsSync(join(ROOT, dir))) return out;
  for (const entry of readdirSync(join(ROOT, dir))) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const path = join(dir, entry);
    if (statSync(join(ROOT, path)).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

const files = walk('.').map((p) => (p.startsWith('./') ? p.slice(2) : p));

// ---------------------------------------------------------------- JSON is valid and canonically formatted
const json = new Map();
for (const path of files.filter((p) => p.endsWith('.json'))) {
  let value;
  try {
    value = JSON.parse(read(path));
  } catch (error) {
    fail(path, `is not valid JSON — ${error.message}`);
    continue;
  }
  json.set(path, value);
  if (read(path) !== `${JSON.stringify(value, null, 2)}\n`) {
    fail(path, 'is not formatted as two-space JSON with a trailing newline');
  }
}

const need = (path) => {
  if (!json.has(path)) fail(path, 'is missing');
  return json.get(path);
};

// ---------------------------------------------------------------- the manifests agree
const portable = need(`${PLUGIN}/plugin.json`);
const claude = need(`${PLUGIN}/.claude-plugin/plugin.json`);
const marketplace = need('.claude-plugin/marketplace.json');

if (portable && claude) {
  for (const field of SHARED_MANIFEST_FIELDS) {
    if (JSON.stringify(portable[field]) !== JSON.stringify(claude[field])) {
      fail('manifests', `\`${field}\` differs between the portable and Claude manifests`);
    }
  }
  if (JSON.stringify(portable.keywords) !== JSON.stringify(claude.keywords)) {
    fail('manifests', '`keywords` differ between the portable and Claude manifests');
  }
  if (JSON.stringify(portable.author) !== JSON.stringify(claude.author)) {
    fail('manifests', '`author` differs between the portable and Claude manifests');
  }
  // Each client reads its own shape; only the editor schema hint may differ between these two files.
  const extra = Object.keys(claude).filter((k) => !(k in portable) && k !== '$schema');
  if (extra.length) fail('manifests', `the Claude manifest has unexpected extra fields: ${extra.join(', ')}`);
}

if (marketplace) {
  if (marketplace.name !== SERVER_KEY) fail('marketplace.json', `name must be "${SERVER_KEY}"`);
  if (!marketplace.owner?.name) fail('marketplace.json', 'owner.name is required');
  const entries = marketplace.plugins ?? [];
  if (entries.length !== 1) fail('marketplace.json', 'expected exactly one plugin entry');
  const [entry] = entries;
  if (entry) {
    if (entry.name !== portable?.name) fail('marketplace.json', 'the entry name must match the plugin name');
    if (entry.source !== `./${PLUGIN}`) fail('marketplace.json', `the entry source must be "./${PLUGIN}"`);
    // The version is pinned in plugin.json alone; repeating it here doubles the bookkeeping for no gain.
    if ('version' in entry) fail('marketplace.json', 'do not set version on the entry — plugin.json owns it');
  }
}

// ---------------------------------------------------------------- the connector URL, exactly
const mcp = need(`${PLUGIN}/.mcp.json`);
if (mcp) {
  const server = mcp.mcpServers?.[SERVER_KEY];
  if (!server) fail('.mcp.json', `expected a server named "${SERVER_KEY}"`);
  else {
    // A url without a type is read as stdio and silently skipped.
    if (server.type !== 'http') fail('.mcp.json', 'transport type must be "http"');
    if (server.url !== CONNECTOR_URL) fail('.mcp.json', `url must be exactly ${CONNECTOR_URL}`);
  }
}

// ---------------------------------------------------------------- nothing points at a non-production environment
for (const path of files.filter((p) => !p.startsWith('.git/'))) {
  if (path === 'CONTRIBUTING.md' || path === 'AGENTS.md' || path === 'scripts/validate.mjs') continue;
  const text = read(path);
  // An environment prefix is a whole label: `dev-mcp.…` and `staging.…`, never `developers.freightright.com`.
  const stray = text.match(/https?:\/\/(?:[a-z0-9-]+\.)*(?:dev|staging|qa|uat)[-.][a-z0-9.-]+|https?:\/\/(?:localhost|127\.0\.0\.1)/i);
  if (stray) fail(path, `mentions a non-production host: ${stray[0]}`);
}

// ---------------------------------------------------------------- the contract, and what the skills say about it
const contract = need('contract/tools.json');
const toolNames = new Set((contract?.tools ?? []).map((t) => t.name));
if (!toolNames.size) fail('contract/tools.json', 'contains no tools');
if (contract && !contract.source?.revision) fail('contract/tools.json', 'does not record the fr-mcp revision');

const frontmatter = (text) => {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const fields = new Map();
  for (const line of text.slice(4, end).split('\n')) {
    const match = /^([A-Za-z-]+):\s*(.*)$/.exec(line);
    if (match) fields.set(match[1], match[2].trim());
  }
  return fields;
};

const skillDir = `${PLUGIN}/skills`;
const skills = existsSync(join(ROOT, skillDir)) ? readdirSync(join(ROOT, skillDir)) : [];
const mentioned = new Set();

for (const dir of skills) {
  const path = `${skillDir}/${dir}/SKILL.md`;
  if (!existsSync(join(ROOT, path))) {
    fail(path, 'is missing');
    continue;
  }
  const text = read(path);
  const fields = frontmatter(text);
  if (!fields) {
    fail(path, 'must open with YAML frontmatter on line 1');
    continue;
  }
  for (const key of fields.keys()) {
    if (!PORTABLE_FIELDS.has(key)) {
      fail(path, `\`${key}\` is outside the portable Agent Skills fields, so this file stops being portable`);
    }
  }
  if (fields.has('allowed-tools')) {
    fail(path, '`allowed-tools` pre-approves tools rather than documenting them — do not ship it');
  }
  const name = fields.get('name');
  if (name !== dir) fail(path, `name "${name}" must match the directory name "${dir}"`);
  if (name && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) fail(path, `name "${name}" is not lowercase-hyphenated`);
  if (name && name.length > 64) fail(path, 'name is longer than 64 characters');
  const description = fields.get('description') ?? '';
  if (!description) fail(path, 'description is required');
  if (description.length > 1024) fail(path, `description is ${description.length} characters; the limit is 1024`);
  const lines = text.split('\n').length;
  if (lines > 500) fail(path, `is ${lines} lines; keep a skill body under 500`);
}

// Every tool named anywhere must exist, and every tool must be reachable from a skill.
for (const path of files.filter((p) => p.endsWith('.md') || p.endsWith('.mjs'))) {
  if (path === 'scripts/validate.mjs') continue;
  // Strip the scoped MCP prefix first: `mcp__plugin_freightright_freightright__foo` is one tool name, not two.
  const text = read(path).replace(/mcp__plugin_[a-z0-9]+_[a-z0-9]+__/g, '');
  for (const token of text.match(/freightright_[a-z_]+/g) ?? []) {
    if (!toolNames.has(token)) fail(path, `names "${token}", which is not in contract/tools.json`);
    if (path.startsWith(skillDir)) mentioned.add(token);
  }
}
for (const tool of toolNames) {
  if (!mentioned.has(tool)) fail('skills', `${tool} is not covered by any skill`);
}

// ---------------------------------------------------------------- evals: every grader names a tool that is mocked
const evalsDir = `${PLUGIN}/evals`;
const mockDir = `${evalsDir}/mocks/${SERVER_KEY}`;
const mocked = existsSync(join(ROOT, mockDir))
  ? new Set(readdirSync(join(ROOT, mockDir)).filter((f) => f.endsWith('.md') && !f.startsWith('_'))
      .map((f) => f.replace(/\.md$/, '')))
  : new Set();

if (existsSync(join(ROOT, evalsDir))) {
  for (const tool of toolNames) {
    if (!mocked.has(tool)) fail('evals/mocks', `${tool} has no mock, so it is unavailable to every eval case`);
  }
  for (const path of walk(evalsDir).filter((p) => p.endsWith('.yaml') || p.endsWith('.md'))) {
    for (const [, name] of read(path).matchAll(/^\s*(?:tool|before|after):\s*(\S+)\s*$/gm)) {
      const bare = name.replace(/^mcp__plugin_[a-z0-9]+_[a-z0-9]+__/, '');
      if (bare.startsWith('freightright_') && !mocked.has(bare)) {
        fail(path, `grader names "${name}", which has no mock — a "must not call" check would pass vacuously`);
      }
    }
  }
}

// Grader shape. A `regex` grader given `min`/`max` is not a stricter check — the case file fails to load and the
// case silently does not run, which is how a suite ends up proving less than it claims.
const GRADER_KEYS = {
  regex: new Set(['name', 'type', 'weight', 'arm', 'pattern', 'flags', 'match', 'target']),
  tool_used: new Set(['name', 'type', 'weight', 'arm', 'tool', 'input_match', 'min', 'max']),
  tool_order: new Set(['name', 'type', 'weight', 'arm', 'before', 'after']),
  file_exists: new Set(['name', 'type', 'weight', 'arm', 'path', 'exists']),
  llm: new Set(['name', 'type', 'weight', 'arm', 'criteria', 'focus']),
  baseline: new Set(['name', 'type', 'weight', 'arm', 'criteria', 'baseline_file']),
};

for (const path of walk(evalsDir).filter((p) => p.endsWith('case.yaml'))) {
  const graders = read(path).split(/^graders:\s*$/m)[1];
  if (!graders) {
    fail(path, 'has no graders');
    continue;
  }
  let type = null;
  let label = '?';
  for (const line of graders.split('\n')) {
    const key = /^\s{2,4}(?:- )?([a-z_]+):/.exec(line);
    if (!key) continue;
    if (key[1] === 'name') label = line.split(':').slice(1).join(':').trim();
    if (key[1] === 'type') {
      type = line.split(':').slice(1).join(':').trim().replace(/['"]/g, '');
      if (!(type in GRADER_KEYS)) fail(path, `grader "${label}" has unknown type "${type}"`);
    } else if (type && GRADER_KEYS[type] && !GRADER_KEYS[type].has(key[1])) {
      fail(path, `grader "${label}" (${type}) does not accept \`${key[1]}\` — the case will fail to load`);
    }
  }
}

// ---------------------------------------------------------------- referenced assets exist, on the right side
for (const path of files.filter((p) => p.endsWith('.md'))) {
  const base = path.startsWith(PLUGIN) ? PLUGIN : '.';
  for (const [, href] of read(path).matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    if (/^https?:/.test(href)) continue;
    if (!existsSync(join(ROOT, base, href))) fail(path, `references a missing asset: ${href}`);
  }
}
for (const manifest of [portable, claude]) {
  const logo = manifest?.logo;
  if (logo && !existsSync(join(ROOT, PLUGIN, logo))) {
    fail('plugin.json', `logo ${logo} must exist inside ${PLUGIN} — repository-root assets are not installed`);
  }
}

// ----------------------------------------------------------------
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}:\n`);
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  console.error('');
  process.exit(1);
}
const version = portable?.version ?? '?';
console.log(
  `Validated plugin ${version}: ${toolNames.size} tools across ${skills.length} skills, ` +
  `contract @ ${(contract?.source?.revision ?? '').slice(0, 12)}`
);
