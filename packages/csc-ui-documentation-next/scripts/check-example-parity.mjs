/**
 * Example flavor parity check (ADR-0020).
 *
 * Every canon example (app/examples/<tag>/<name>.vue) must ship all three
 * flavor variants beside it:
 *
 *   <name>.react.tsx        — @cscfi/csc-ui-next-react
 *   <name>.angular.ts       — standalone component, CUSTOM_ELEMENTS_SCHEMA
 *   <name>.typescript.html  — markup fragment (ADR-0024)
 *   <name>.typescript.ts    — optional querySelector wiring for the fragment;
 *                             its absence documents that no script is needed
 *
 * Sibling files with an unknown flavor part are reported too (a naming
 * mistake would otherwise silently produce no tab). Runs as part of the docs
 * build so a coverage gap is a build failure, not silent documentation rot.
 *
 * Canon examples are also copy-paste targets for non-Nuxt apps, so their
 * script blocks must not lean on Nuxt auto-imports: every Vue API and
 * useXxx() composable they call has to be explicitly imported.
 */

import { readFileSync, readdirSync } from 'node:fs';
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
  ['typescript', 'html'],
]);

/**
 * flavor id → additional allowed sibling extensions (ADR-0024: the TypeScript
 * flavor's optional script part).
 */
const OPTIONAL_EXTS = new Map([['typescript', new Set(['ts'])]]);

/**
 * Internal-only elements (keep in sync with useManifest.ts): no docs page,
 * no React wrapper export — their example dirs need no variants.
 */
const INTERNAL_ONLY = new Set(['c-dropdown']);

/** Vue APIs that Nuxt would auto-import; canon examples must import them. */
const VUE_APIS = new Set([
  'computed',
  'defineAsyncComponent',
  'defineComponent',
  'inject',
  'nextTick',
  'onBeforeMount',
  'onBeforeUnmount',
  'onBeforeUpdate',
  'onMounted',
  'onUnmounted',
  'onUpdated',
  'provide',
  'reactive',
  'readonly',
  'ref',
  'shallowRef',
  'toRef',
  'toRefs',
  'watch',
  'watchEffect',
]);

/**
 * Flag Vue APIs and useXxx() composables that a canon example calls without
 * importing (compiles under Nuxt auto-imports, breaks when copied elsewhere).
 */
const findAutoImportReliance = (source) => {
  const script = source.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1];

  if (!script) return [];

  const imported = new Set(
    [...script.matchAll(/import\s+(?:type\s+)?{([^}]*)}/g)].flatMap((m) =>
      m[1].split(',').map((name) =>
        name
          .replace(/\btype\b/, '')
          .replace(/^[\s\S]*\bas\b/, '')
          .trim(),
      ),
    ),
  );

  const called = [...script.matchAll(/\b([a-zA-Z][a-zA-Z0-9]*)\s*[(<]/g)]
    .map((m) => m[1])
    .filter((name) => VUE_APIS.has(name) || /^use[A-Z]/.test(name));

  return [...new Set(called)].filter((name) => !imported.has(name));
};

const problems = [];

for (const dir of readdirSync(examplesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;

  const files = readdirSync(path.join(examplesDir, dir.name));
  const requireVariants = !INTERNAL_ONLY.has(dir.name);

  const canons = files
    .filter((f) => f.endsWith('.vue') && f.split('.').length === 2)
    .map((f) => f.replace(/\.vue$/, ''));

  for (const canon of canons) {
    for (const [flavor, ext] of VARIANTS) {
      if (!requireVariants) break;

      const expected = `${canon}.${flavor}.${ext}`;

      if (!files.includes(expected)) {
        problems.push(`${dir.name}/${expected} is missing`);
      }
    }

    const source = readFileSync(
      path.join(examplesDir, dir.name, `${canon}.vue`),
      'utf8',
    );

    for (const name of findAutoImportReliance(source)) {
      problems.push(
        `${dir.name}/${canon}.vue: "${name}" relies on Nuxt auto-import — add an explicit import`,
      );
    }
  }

  for (const file of files) {
    if (!requireVariants) break;

    const parts = file.split('.');

    if (parts.length < 3) continue;

    const [name, flavor] = parts;
    const ext = parts.at(-1);

    if (!VARIANTS.has(flavor)) {
      problems.push(`${dir.name}/${file}: unknown flavor "${flavor}"`);
    } else if (!canons.includes(name)) {
      problems.push(`${dir.name}/${file}: no canon ${name}.vue beside it`);
    } else if (
      VARIANTS.get(flavor) !== ext &&
      !OPTIONAL_EXTS.get(flavor)?.has(ext)
    ) {
      problems.push(
        `${dir.name}/${file}: extension ".${ext}" is not valid for the "${flavor}" flavor`,
      );
    }
  }
}

if (problems.length) {
  console.error(`example parity: ${problems.length} problem(s)\n`);

  for (const problem of problems) console.error(`  ${problem}`);

  process.exit(1);
}

console.log(
  'example parity: every canon example has all flavor variants and explicit imports',
);
