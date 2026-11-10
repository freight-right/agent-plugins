#!/usr/bin/env node
// Gemini CLI reads skills/<name>/SKILL.md from the extension root. A symlink there does not survive its install from a
// GitHub Release (it is rewritten to the temporary download folder and broken), so the root `skills/` is a real copy
// of the plugin's skills. Edit the plugin's skills, then run this; `npm run validate` fails while the two differ.
//
//   npm run sync-skills

import { cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(ROOT, 'plugins/freightright/skills');
const target = join(ROOT, 'skills');

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log('skills/ now matches plugins/freightright/skills');
