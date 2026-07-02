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
import { lintComponent } from './lint.mjs';
import { analyzeScript } from './script-api.mjs';
import { extractSharedTypes } from './shared-types.mjs';
import { analyzeTemplate } from './template.mjs';

const packageRoot = path.resolve(fileURLToPath(import.meta.url), '../../..');

const componentsDir = path.join(packageRoot, 'src/components');

const distDir = path.join(packageRoot, 'dist');

const args = process.argv.slice(2);

const strict = args.includes('--strict');

const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const verbose = args.includes('--verbose') || Boolean(only);

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

  const scriptApi = script
    ? analyzeScript(script.content, sfcPath, className)
    : { docblock: '', events: [], hasEventMap: false, methods: [], props: [] };

  const { description, tags: docTags } = parseDocblock(scriptApi.docblock);

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
    props: scriptApi.props,
    script: script?.content ?? '',
    source,
    tagName,
    template,
    usagePath: hasUsage ? `docs/${tagName}/usage.md` : null,
    usageSource: hasUsage ? usageSource : null,
  };
};

// ---- analyze ----------------------------------------------------------------

const tags = readdirSync(componentsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((tag) => !only || tag === only)
  .sort();

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
  const { errors, warnings } = lintComponent(component);

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

// ---- emit -------------------------------------------------------------------

if (!only) {
  const sharedTypesPath = path.join(packageRoot, 'src/types.ts');

  const sharedTypes = existsSync(sharedTypesPath)
    ? extractSharedTypes(sharedTypesPath)
    : [];

  mkdirSync(distDir, { recursive: true });
  writeFileSync(
    path.join(distDir, 'custom-elements.json'),
    `${JSON.stringify(buildManifest(components, sharedTypes), null, 2)}\n`,
  );

  for (const component of components) {
    if (!component.usageSource) continue;

    const target = path.join(distDir, 'docs', component.tagName);

    mkdirSync(target, { recursive: true });
    copyFileSync(component.usageSource, path.join(target, 'usage.md'));
  }

  console.log(
    `\ncustom-elements.json: ${components.length} components, ${sharedTypes.length} shared types`,
  );
}

console.log(
  `lint: ${errorCount} errors, ${warningCount} warnings — props described ${documented.props}/${documented.totalProps}, events described ${documented.events}/${documented.totalEvents}, event maps ${components.filter((c) => c.hasEventMap).length}/${components.length}, usage docs ${components.filter((c) => c.usagePath).length}/${components.length}, seeded pending review ${seededCount}`,
);

if (failures.length || (strict && errorCount)) process.exit(1);
