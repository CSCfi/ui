// Regenerate the chromatic color ramps (steps 50–950) in tokens/theme/base.json
// from the brand seeds.
//
// The ramp math lives in the shared core (src/theme/ramp.js) so the runtime
// theming API (applyTheme) produces byte-identical output — see ADR-0011. This
// script only wires that core to the token JSON on disk.
//
// Neutral ladders (slate, tertiary) and white/black are intentionally NOT
// regenerated here — they are tuned by hand (slate is the dark-surface ladder).
//
// Usage:  node scripts/generate-ramps.mjs        (writes base.json)
//         node scripts/generate-ramps.mjs --check (prints, does not write)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_SEEDS, FAMILIES, ramp, STEPS } from '../src/theme/ramp.js';

const dir = path.dirname(fileURLToPath(import.meta.url));

const BASE = path.resolve(dir, '../tokens/theme/base.json');

const json = JSON.parse(fs.readFileSync(BASE, 'utf8'));

for (const family of FAMILIES) {
  if (!json.theme[family])
    throw new Error(`family "${family}" not found in base.json`);

  const r = ramp(DEFAULT_SEEDS[family]);
  json.theme[family] = Object.fromEntries(
    STEPS.map((s) => [String(s), { value: r[String(s)] }]),
  );
}

const out = `${JSON.stringify(json, null, 2)}\n`;

if (process.argv.includes('--check')) {
  for (const family of FAMILIES) {
    const r = json.theme[family];
    console.log(
      family.padEnd(10),
      STEPS.map((s) => r[String(s)].value.slice(0, 7)).join(' '),
    );
  }
} else {
  fs.writeFileSync(BASE, out);
  console.log(
    `Wrote ${path.relative(process.cwd(), BASE)} — ${FAMILIES.length} families, steps 50–950.`,
  );
}
