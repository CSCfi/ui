/**
 * Docs analyzer entry point (ADR-0012).
 *
 * Reads every component SFC under src/components/, extracts the documented API
 * surface (props/attributes, events via the typed event map, exposed methods,
 * slots, CSS parts, CSS custom properties), lints the docs contract, and emits:
 *
 *   dist/custom-elements.json      Custom Elements Manifest (CEM schema)
 *   dist/docs/<tag>/usage.md       colocated usage docs, copied verbatim
 *
 * Usage:
 *   node scripts/analyzer/index.mjs [--strict] [--verbose] [--only <tag>]
 *
 *   --strict   exit 1 on lint errors (CI gate; off by default while the
 *              docblock rollout is in progress)
 *   --verbose  print each lint message, not just per-component counts
 *   --only     restrict to one component tag (implies --verbose)
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'vue/compiler-sfc';

import { buildManifest } from './cem.mjs';
import { parseDocblock } from './docblock.mjs';
import { emitIdeData } from './ide-data.mjs';
import { lintComponent } from './lint.mjs';
import { analyzeScript } from './script-api.mjs';
import { extractExportedTypes, extractSharedTypes } from './shared-types.mjs';
import { emitTagNameMap } from './tag-map.mjs';
import { analyzeTemplate } from './template.mjs';
import { buildAliasTable } from './type-expansion.mjs';

const packageRoot = path.resolve(fileURLToPath(import.meta.url), '../../..');

const componentsDir = path.join(packageRoot, 'src/components');

const distDir = path.join(packageRoot, 'dist');

const args = process.argv.slice(2);

const strict = args.includes('--strict');

// --tag-map: emit only src/tag-name-map.ts. Runs before vue-tsc in the build
// (the map is package source; dist artifacts come later and vite wipes dist/).
const tagMapOnly = args.includes('--tag-map');

const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const verbose = args.includes('--verbose') || Boolean(only);

const sharedTypesPath = path.join(packageRoot, 'src/types.ts');

const sharedTypesSource = existsSync(sharedTypesPath)
  ? readFileSync(sharedTypesPath, 'utf8')
  : '';

const analyzeComponent = (tagName) => {
  const dir = path.join(componentsDir, tagName);

  const sfcName = readdirSync(dir).find((f) => f.endsWith('.vue'));

  if (!sfcName) return null;

  const sfcPath = path.join(dir, sfcName);

  const source = readFileSync(sfcPath, 'utf8');

  const { descriptor, errors } = parse(source, { filename: sfcPath });

  if (errors.length) {
    throw new Error(`${tagName}: SFC parse failed — ${errors[0].message}`);
  }

  const className = sfcName.replace(/\.vue$/, '');

  const script = descriptor.scriptSetup ?? descriptor.script;

  // The plain `<script>` block holds the exported component-owned types and
  // the props interface (ADR-0015); it only counts as a separate block when a
  // `<script setup>` also exists.
  const plainScript = descriptor.scriptSetup ? descriptor.script : null;

  // Aliases resolvable from this component's props: its own two script blocks
  // plus the shared types file. Used to expand literal unions into `type.text`
  // (ADR-0015).
  const aliasTable = buildAliasTable([
    { content: sharedTypesSource, fileName: sharedTypesPath },
    { content: plainScript?.content ?? '', fileName: `${sfcPath}#plain` },
    { content: script?.content ?? '', fileName: sfcPath },
  ]);

  const scriptApi = script
    ? analyzeScript(script.content, sfcPath, className, {
        aliasTable,
        plainContent: plainScript?.content ?? '',
      })
    : { docblock: '', events: [], hasEventMap: false, methods: [], props: [] };

  // Exported component-owned types (ADR-0015), tagged with their owner for
  // the manifest's `csc.types` and the docs Types page.
  const ownedTypes = plainScript
    ? extractExportedTypes(plainScript.content, `${sfcPath}#plain`, tagName)
    : [];

  const { description, tags: docTags } = parseDocblock(scriptApi.docblock);

  // `@subcomponents c-a, c-b` lists the composed children folded into this
  // parent's docs page (ADR-0013). The docblock parser splits name/description
  // at the first token, so rejoin and split the whole list on commas/space.
  const subcomponents = docTags
    .filter((t) => t.tag === 'subcomponents')
    .flatMap((t) => `${t.name} ${t.description}`.split(/[\s,]+/))
    .filter(Boolean);

  const template = analyzeTemplate(descriptor.template?.ast);

  const usageSource = path.join(dir, 'usage.md');

  const hasUsage = existsSync(usageSource);

  return {
    className,
    description,
    docTags,
    events: scriptApi.events,
    hasEventMap: scriptApi.hasEventMap,
    methods: scriptApi.methods,
    modulePath: path.relative(packageRoot, sfcPath),
    ownedTypes,
    props: scriptApi.props,
    script: [plainScript?.content, script?.content].filter(Boolean).join('\n'),
    source,
    subcomponents,
    tagName,
    template,
    usagePath: hasUsage ? `docs/${tagName}/usage.md` : null,
    usageSource: hasUsage ? usageSource : null,
  };
};

// ---- analyze ----------------------------------------------------------------

const allTags = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

// The full component universe, independent of --only, so @subcomponents
// validation resolves children even when analyzing a single component.
const knownTags = new Set(allTags);

const tags = allTags.filter((tag) => !only || tag === only);

if (only && !tags.length) {
  console.error(`unknown component "${only}"`);
  process.exit(1);
}

const components = [];

const failures = [];

for (const tag of tags) {
  try {
    const component = analyzeComponent(tag);

    if (component) components.push(component);
  } catch (error) {
    failures.push(String(error.message ?? error));
  }
}

// ---- lint -------------------------------------------------------------------

let errorCount = 0;

let warningCount = 0;

const documented = { events: 0, props: 0, totalEvents: 0, totalProps: 0 };

let seededCount = 0;

for (const component of components) {
  const { errors, warnings } = lintComponent(component, knownTags);

  errorCount += errors.length;
  warningCount += warnings.length;
  seededCount += component.source.match(/@seeded/g)?.length ?? 0;

  const described = component.props.filter((p) => p.description).length;

  documented.props += described;
  documented.totalProps += component.props.length;
  documented.events += component.events.filter((e) => e.description).length;
  documented.totalEvents += component.events.length;

  if (verbose && (errors.length || warnings.length)) {
    console.log(`\n${component.tagName}`);

    for (const message of errors) console.log(`  error    ${message}`);

    for (const message of warnings) console.log(`  warning  ${message}`);
  } else if (errors.length || warnings.length) {
    console.log(
      `${component.tagName.padEnd(28)} ${String(errors.length).padStart(3)} errors  ${String(warnings.length).padStart(3)} warnings  props described ${described}/${component.props.length}`,
    );
  }
}

for (const failure of failures) console.error(`analyze error: ${failure}`);

// ---- re-export completeness (ADR-0015) --------------------------------------
// Every public type — shared (src/types.ts) or component-owned (SFC plain
// script blocks) — must be re-exported from the package entry, or consumers
// cannot import it.

const sharedTypes = sharedTypesSource
  ? extractSharedTypes(sharedTypesPath)
  : [];

const publicTypes = [
  ...sharedTypes,
  ...components.flatMap((c) => c.ownedTypes),
];

if (!only) {
  const entrySource = readFileSync(
    path.join(packageRoot, 'src/index.ts'),
    'utf8',
  );

  for (const type of publicTypes) {
    if (!new RegExp(`\\b${type.name}\\b`).test(entrySource)) {
      errorCount += 1;
      console.log(
        `index.ts    error    public type "${type.name}" (${type.owner ?? 'shared'}) is not re-exported from src/index.ts`,
      );
    }
  }
}

// ---- emit -------------------------------------------------------------------

// The typed tag-name map is package source (vue-tsc emits its declarations),
// so it is committed and drift-checked rather than built into dist.
if (!only) {
  const { changed, target } = emitTagNameMap(
    components,
    publicTypes,
    packageRoot,
  );

  if (changed) {
    const relative = path.relative(packageRoot, target);

    if (strict) {
      errorCount += 1;
      console.log(
        `tag-name-map    error    ${relative} was stale — regenerated, commit it and rebuild`,
      );
    } else {
      console.log(`tag-name-map: regenerated ${relative}`);
    }
  }
}

if (tagMapOnly) {
  process.exit(failures.length || (strict && errorCount) ? 1 : 0);
}

if (!only) {
  const manifest = buildManifest(components, publicTypes);

  mkdirSync(distDir, { recursive: true });
  writeFileSync(
    path.join(distDir, 'custom-elements.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );

  // IDE completion data derived from the manifest (ADR-0015).
  emitIdeData(manifest, distDir);

  for (const component of components) {
    if (!component.usageSource) continue;

    const target = path.join(distDir, 'docs', component.tagName);

    mkdirSync(target, { recursive: true });
    copyFileSync(component.usageSource, path.join(target, 'usage.md'));
  }

  console.log(
    `\ncustom-elements.json: ${components.length} components, ${sharedTypes.length} shared types, ${publicTypes.length - sharedTypes.length} component-owned types`,
  );
}

console.log(
  `lint: ${errorCount} errors, ${warningCount} warnings — props described ${documented.props}/${documented.totalProps}, events described ${documented.events}/${documented.totalEvents}, event maps ${components.filter((c) => c.hasEventMap).length}/${components.length}, usage docs ${components.filter((c) => c.usagePath).length}/${components.length}, families ${components.filter((c) => c.subcomponents.length).length}, seeded pending review ${seededCount}`,
);

if (failures.length || (strict && errorCount)) process.exit(1);
