/**
 * API snapshot (CONTEXT.md, ADR-0049): a condensed rendering of each tag's
 * public surface, committed beside its SFC as `api.snapshot.json`. The strict
 * analyzer proves the manifest is consistent; this spec proves it did not
 * change without a reviewed diff. Update with `vitest run --project node -u`.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { DEFAULTABLE_PROPS, VALUE_TAGS } from './tag-name-map';
import { NO_ROOT_PART } from './test/conformance/root-part';

interface Attribute extends Typed {
  fieldName: string;
}

interface Declaration {
  attributes: Attribute[];
  csc?: { subcomponents?: string[] };
  cssParts: Named[];
  cssProperties: Named[];
  cssStates: Named[];
  events: Typed[];
  members: Member[];
  slots: Named[];
  tagName?: string;
}

interface Manifest {
  csc: { types: Named[] };
  modules: Array<{ declarations?: Declaration[] }>;
}

interface Member extends Typed {
  kind: 'field' | 'method';
}

interface Named {
  name: string;
}

interface Typed {
  csc?: { defaultable?: boolean; signature?: string };
  default?: string;
  name: string;
  type?: { text: string };
}

const srcDir = fileURLToPath(new URL('.', import.meta.url));

const packageRoot = resolve(srcDir, '..');

// Regenerate the manifest from SOURCE (non-strict — the build's strict run is
// the consistency gate) so the snapshot never compares against a stale dist.
execFileSync(process.execPath, ['scripts/analyzer/index.mjs'], {
  cwd: packageRoot,
  stdio: 'ignore',
});

const manifest = JSON.parse(
  readFileSync(join(packageRoot, 'dist/custom-elements.json'), 'utf8'),
) as Manifest;

const declarations = manifest.modules
  .flatMap((m) => m.declarations ?? [])
  .filter((d): d is { tagName: string } & Declaration => Boolean(d.tagName));

const sortedObject = (
  entries: Array<[string, string]>,
): Record<string, string> =>
  Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));

const typeText = (t: Typed): string => t.type?.text ?? 'unknown';

const withDefault = (t: Typed): string =>
  t.default === undefined ? typeText(t) : `${typeText(t)} = ${t.default}`;

const names = (list: Named[]): string[] => list.map((n) => n.name).sort();

/** The reviewable shape of one tag's public API. Descriptions are prose, not API — excluded. */
const condense = (d: { tagName: string } & Declaration) => {
  const fields = d.members.filter((m) => m.kind === 'field');

  const attributeFields = new Set(d.attributes.map((a) => a.fieldName));

  return {
    attributes: sortedObject(d.attributes.map((a) => [a.name, withDefault(a)])),
    cssProperties: names(d.cssProperties),
    defaultable: fields
      .filter((f) => f.csc?.defaultable)
      .map((f) => f.name)
      .sort(),
    events: sortedObject(d.events.map((e) => [e.name, typeText(e)])),
    methods: sortedObject(
      d.members
        .filter((m) => m.kind === 'method')
        .map((m) => [m.name, m.csc?.signature ?? '()']),
    ),
    parts: names(d.cssParts),
    propertyOnly: fields
      .filter((f) => !attributeFields.has(f.name))
      .map((f) => f.name)
      .sort(),
    props: sortedObject(fields.map((f) => [f.name, withDefault(f)])),
    slots: names(d.slots),
    states: names(d.cssStates),
    subcomponents: [...(d.csc?.subcomponents ?? [])].sort(),
    tag: d.tagName,
  };
};

describe.each(declarations.map((d) => [d.tagName, d] as const))(
  '%s',
  (tag, declaration) => {
    it('matches api.snapshot.json', async () => {
      await expect(
        `${JSON.stringify(condense(declaration), null, 2)}\n`,
      ).toMatchFileSnapshot(`./components/${tag}/api.snapshot.json`);
    });
  },
);

it('describes every component directory and leaves no orphan snapshot', () => {
  const directories = readdirSync(join(srcDir, 'components')).filter((d) =>
    d.startsWith('c-'),
  );

  const tags = new Set(declarations.map((d) => d.tagName));

  expect([...tags].sort()).toEqual(directories.sort());

  // A snapshot whose tag no longer exists would silently outlive its component.
  const orphans = directories.filter(
    (dir) =>
      !tags.has(dir) &&
      existsSync(join(srcDir, 'components', dir, 'api.snapshot.json')),
  );

  expect(orphans).toEqual([]);
});

it('agrees with the generated allow-lists and the conformance exceptions', () => {
  const valueTags = declarations
    .filter((d) => d.events.some((e) => e.name === 'update:value'))
    .map((d) => d.tagName)
    .sort();

  const defaultable = Object.fromEntries(
    declarations
      .map(
        (d) =>
          [
            d.tagName,
            d.members
              .filter((m) => m.csc?.defaultable)
              .map((m) => m.name)
              .sort(),
          ] as const,
      )
      .filter(([, keys]) => keys.length),
  );

  const noRoot = declarations
    .filter((d) => !d.cssParts.some((p) => p.name === 'root'))
    .map((d) => d.tagName)
    .sort();

  expect(valueTags).toEqual([...VALUE_TAGS].sort());
  expect(defaultable).toEqual(
    Object.fromEntries(
      Object.entries(DEFAULTABLE_PROPS).map(([tag, keys]) => [
        tag,
        [...keys].sort(),
      ]),
    ),
  );
  expect(noRoot).toEqual([...NO_ROOT_PART].sort());
});

it('matches the entry snapshot of runtime exports and public types', async () => {
  const source = readFileSync(join(srcDir, 'index.ts'), 'utf8');

  const runtimeExports = new Set<string>();

  for (const m of source.matchAll(/^export (?:const|function) (\w+)/gm))
    runtimeExports.add(m[1]);

  for (const m of source.matchAll(/^export \{([^}]+)\} from/gm)) {
    for (const entry of m[1].split(',')) {
      const name = entry.trim();

      if (name && !name.startsWith('type '))
        runtimeExports.add(name.split(/\s+as\s+/).pop()!);
    }
  }

  const entry = {
    runtimeExports: [...runtimeExports].sort(),
    types: names(manifest.csc.types),
  };

  await expect(`${JSON.stringify(entry, null, 2)}\n`).toMatchFileSnapshot(
    './api.entry.snapshot.json',
  );
});
