/**
 * Example flavor parity check (ADR-0020).
 *
 * Every canon example (app/examples/<tag>/<name>.vue) must ship all three
 * flavor variants beside it:
 *
 *   <name>.react.tsx        — @cscfi/csc-ui-next-react
 *   <name>.angular.ts       — standalone component, CUSTOM_ELEMENTS_SCHEMA
 *   <name>.typescript.ts    — imperative typed DOM
 *
 * Sibling files with an unknown flavor part are reported too (a naming
 * mistake would otherwise silently produce no tab). Runs as part of the docs
 * build so a coverage gap is a build failure, not silent documentation rot.
 */

import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const examplesDir = path.resolve(
  fileURLToPath(import.meta.url),
  '../../app/examples',
);

/** flavor id → required extension. Keep in sync with FLAVORS in useFlavor.ts. */
const VARIANTS = new Map([
  ['react', 'tsx'],
  ['angular', 'ts'],
  ['typescript', 'ts'],
]);

/**
 * Internal-only elements (keep in sync with useManifest.ts): no docs page,
 * no React wrapper export — their example dirs need no variants.
 */
const INTERNAL_ONLY = new Set(['c-dropdown']);

const problems = [];

for (const dir of readdirSync(examplesDir, { withFileTypes: true })) {
  if (!dir.isDirectory() || INTERNAL_ONLY.has(dir.name)) continue;

  const files = readdirSync(path.join(examplesDir, dir.name));

  const canons = files
    .filter((f) => f.endsWith('.vue') && f.split('.').length === 2)
    .map((f) => f.replace(/\.vue$/, ''));

  for (const canon of canons) {
    for (const [flavor, ext] of VARIANTS) {
      const expected = `${canon}.${flavor}.${ext}`;

      if (!files.includes(expected)) {
        problems.push(`${dir.name}/${expected} is missing`);
      }
    }
  }

  for (const file of files) {
    const parts = file.split('.');

    if (parts.length < 3) continue;

    const [name, flavor] = parts;

    if (!VARIANTS.has(flavor)) {
      problems.push(`${dir.name}/${file}: unknown flavor "${flavor}"`);
    } else if (!canons.includes(name)) {
      problems.push(`${dir.name}/${file}: no canon ${name}.vue beside it`);
    }
  }
}

if (problems.length) {
  console.error(`example parity: ${problems.length} problem(s)\n`);

  for (const problem of problems) console.error(`  ${problem}`);

  process.exit(1);
}

console.log('example parity: every canon example has all flavor variants');
