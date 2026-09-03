// Guardrail (ADR-0040): the committed src/theme/chart-data.ts must be exactly
// what scripts/generate-chart-data.mjs renders from the semantic token maps,
// and every hex twin it exports must be a value tokens.css actually emits —
// so the importable chart data and the --c-chart-* variables cannot drift.
// Exit 1 on any drift. Run via `pnpm run lint:chart`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { OUT, render } from './generate-chart-data.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));

const errors = [];

const expected = render();

const actual = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';

if (actual !== expected) {
  errors.push(
    `src/theme/chart-data.ts is stale — run \`pnpm run chart:generate\`.`,
  );
}

const css = fs.readFileSync(
  path.resolve(dir, '../src/styles/css/tokens.css'),
  'utf8',
);

// tokens.css emits every colour as oklch() (ADR-0041) with the same
// cssColor() the generator uses, so each exported string must appear verbatim.
for (const q of expected.match(/'oklch\([^']+\)'/g) ?? []) {
  const value = q.slice(1, -1);

  if (!css.includes(value)) {
    errors.push(
      `${value} is exported as chart data but tokens.css never emits it.`,
    );
  }
}

if (errors.length) {
  console.error(`Chart data parity FAILED:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

console.log(
  'Chart data parity OK — chart-data.ts matches the semantic maps and tokens.css.',
);
