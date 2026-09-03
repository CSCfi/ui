// Ship the hand-written declaration files alongside the ones vue-tsc emits.
//
// `tsconfig.build.json` emits declarations for `src/**/*.ts` and `*.vue` only.
// `src/theme/ramp.js` is plain ESM (so the Node build scripts can import it
// without a TS loader, ADR-0011) and is typed by a hand-written `ramp.d.ts`
// next to it — which vue-tsc neither emits nor copies. Without it the
// published `Family`, `ThemeSeeds`, `DEFAULT_SEEDS` and `FAMILIES` types
// resolve to nothing for consumers. Run after `vue-tsc` in `build:types`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = path.resolve(fileURLToPath(import.meta.url), '../..');

const DECLARATIONS = ['src/theme/ramp.d.ts'];

for (const rel of DECLARATIONS) {
  const from = path.join(pkgRoot, rel);

  const to = path.join(pkgRoot, 'dist-types', path.relative('src', rel));

  if (!fs.existsSync(from)) {
    console.error(`[copy-declarations] ${rel} not found`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log(`[copy-declarations] ${rel} → ${path.relative(pkgRoot, to)}`);
}
