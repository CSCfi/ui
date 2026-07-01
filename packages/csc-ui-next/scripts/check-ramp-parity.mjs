// Guardrail: the shared ramp core (used at runtime by applyTheme) must reproduce
// the committed palette exactly, so consumer-branded ramps match the built-ins.
//
// Asserts, for all chromatic families:
//   1. ramp(seed)      == tokens/theme/base.json
//   2. familyVars(seed) == the emitted --c-* declarations in tokens.css
// Exit 1 on any drift. Run via `npm run lint:ramp`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DEFAULT_SEEDS,
  FAMILIES,
  familyVars,
  ramp,
  STEPS,
} from '../src/theme/ramp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));

const base = JSON.parse(
  fs.readFileSync(path.resolve(dir, '../tokens/theme/base.json'), 'utf8'),
);

const css = fs.readFileSync(
  path.resolve(dir, '../src/styles/css/tokens.css'),
  'utf8',
);

const errors = [];

// 1. ramp() vs base.json
for (const family of FAMILIES) {
  const r = ramp(DEFAULT_SEEDS[family]);

  for (const s of STEPS) {
    const expected = base.theme[family][String(s)].value;

    if (r[String(s)] !== expected) {
      errors.push(
        `ramp ${family}-${s}: got ${r[String(s)]} expected ${expected}`,
      );
    }
  }
}

// 2. familyVars() vs the --c-* declarations in tokens.css
const declared = new Map();

for (const m of css.matchAll(/--c-([a-z]+)-(\w+):\s*([^;]+);/g)) {
  declared.set(`--c-${m[1]}-${m[2]}`, m[3].trim());
}

for (const family of FAMILIES) {
  const vars = familyVars(family, DEFAULT_SEEDS[family]);

  for (const [name, value] of Object.entries(vars)) {
    const got = declared.get(name);

    if (got !== value) {
      errors.push(`css ${name}: got ${got ?? '(missing)'} expected ${value}`);
    }
  }
}

if (errors.length) {
  console.error(`Ramp parity FAILED (${errors.length}):`);

  for (const e of errors.slice(0, 30)) console.error(`  ${e}`);
  process.exit(1);
}

console.log(
  `Ramp parity OK — ${FAMILIES.length} families × ${STEPS.length} steps match base.json and tokens.css.`,
);
