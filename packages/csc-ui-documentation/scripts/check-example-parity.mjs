/**
 * Example flavor parity check.
 *
 * Every canon example (app/examples/<tag>/<name>.vue) must ship all three
 * flavor variants beside it:
 *
 *   <name>.react.tsx        — @cscfi/csc-ui-react
 *   <name>.angular.ts       — standalone component, CUSTOM_ELEMENTS_SCHEMA
 *   <name>.typescript.html  — markup fragment
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
 *
 * The ```vue snippets in each component's usage.md are copy-paste targets
 * too, and ESLint never sees them: they get the canons' `.prop` check, and
 * an `@update:*` listener on a `c-*` element fails, as ESLint fails it in
 * `.vue` files (Vue never attaches one to an element, ADR-0075).
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const examplesDir = path.resolve(
  fileURLToPath(import.meta.url),
  '../../app/examples',
);

const componentsDir = path.resolve(
  fileURLToPath(import.meta.url),
  '../../../csc-ui/src/components',
);

const manifestPath = path.resolve(
  fileURLToPath(import.meta.url),
  '../../../csc-ui/dist/custom-elements.json',
);

if (!existsSync(manifestPath)) {
  console.error(
    `custom-elements.json not found at ${manifestPath} — build @cscfi/csc-ui first`,
  );
  process.exit(1);
}

/** flavor id → required extension. Keep in sync with FLAVORS in useFlavor.ts. */
const VARIANTS = new Map([
  ['angular', 'ts'],
  ['react', 'tsx'],
  ['typescript', 'html'],
]);

/**
 * flavor id → additional allowed sibling extensions (the TypeScript flavor's
 * optional script part).
 */
const OPTIONAL_EXTS = new Map([['typescript', new Set(['ts'])]]);

/**
 * Internal tags (ADR-0075), as the manifest names them: no docs page, so
 * their example dirs, if any, need no variants.
 */
const INTERNAL_TAGS = new Set(
  JSON.parse(readFileSync(manifestPath, 'utf8')).csc?.internalTags ?? [],
);

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

/**
 * Vue sets every declared prop of a csc-ui element as a property on its own
 * (camelizing hyphenated names); `.prop` forces the literal key, so
 * `:level-labels.prop` writes a dead `el['level-labels']`.
 */
const findPropModifiers = (source) =>
  [...source.matchAll(/:[a-zA-Z-]+\.prop\b/g)].map(
    (match) =>
      `"${match[0]}" — ".prop" is unnecessary on csc-ui elements and silently breaks hyphenated names; bind plainly (:items="…")`,
  );

/**
 * Vue's runtime skips every `onUpdate:*` listener on an element, so
 * `@update:value` on a `c-*` element never fires (ADR-0075).
 */
const findUpdateListeners = (source) =>
  [...source.matchAll(/(?:@|v-on:)update:[\w-]+/g)]
    .filter((match) =>
      [...source.slice(0, match.index).matchAll(/<([a-zA-Z][\w-]*)/g)]
        .at(-1)?.[1]
        .startsWith('c-'),
    )
    .map(
      (match) =>
        `"${match[0]}" — Vue never attaches an @update:* listener to a custom element; use v-model, @input with the element's value, or @change`,
    );

const problems = [];

for (const dir of readdirSync(examplesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;

  const files = readdirSync(path.join(examplesDir, dir.name));

  const requireVariants = !INTERNAL_TAGS.has(dir.name);

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

    for (const problem of findPropModifiers(source)) {
      problems.push(`${dir.name}/${canon}.vue: ${problem}`);
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

for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
  const usagePath = path.join(componentsDir, dir.name, 'usage.md');

  if (!dir.isDirectory() || !existsSync(usagePath)) continue;

  const usage = readFileSync(usagePath, 'utf8');

  for (const [, snippet] of usage.matchAll(/```vue\n([\s\S]*?)```/g)) {
    for (const problem of [
      ...findPropModifiers(snippet),
      ...findUpdateListeners(snippet),
    ]) {
      problems.push(`${dir.name}/usage.md: ${problem}`);
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
