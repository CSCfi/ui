/**
 * Extract the 3.x public API (ADR-0027 amendment, plan R2) from the
 * per-component readmes Stencil generated for the last 3.x release, and write
 * it to `scripts/v3-api.json` for the migration-guide guard
 * (`check-migration-guide.mjs`).
 *
 * The readmes are the only complete record of the 3.x API: each lists every
 * prop's attribute name, type and default, plus events, methods, slots and
 * CSS custom properties. The 3.x `vscode-data.json` has names only, and the
 * published tarball has no `docs.json`. 3.x is frozen, so this runs once; the
 * JSON is committed.
 *
 * Usage: node scripts/extract-v3-api.mjs [git-ref]   (default: v3.0.19)
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ref = process.argv[2] ?? 'v3.0.19';

const outPath = fileURLToPath(new URL('v3-api.json', import.meta.url));

const componentsDir = 'packages/csc-ui/src/components';

const git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1e8 });

const files = git(
  'ls-tree',
  '-r',
  '--full-tree',
  '--name-only',
  ref,
  '--',
  componentsDir,
)
  .split('\n')
  .filter(Boolean);

// A readme beside no component source is an orphan (3.x shipped a stray
// `c-text-fiel-open/readme.md`); only directories with a `<tag>.tsx` were tags.
const tags = files
  .filter((file) => file.endsWith('/readme.md'))
  .map((file) => file.split('/').at(-2))
  .filter((tag) => files.includes(`${componentsDir}/${tag}/${tag}.tsx`))
  .sort();

/**
 * 3.x typed some props with string enums (`CAlertType.Error`); resolve each
 * member to its literal so a type compares with the 4.x literal union.
 */
const enumMembers = new Map();

const types = git('show', `${ref}:packages/csc-ui/src/types/index.ts`);

for (const [, name, body] of types.matchAll(/export enum (\w+) \{([^}]*)\}/g)) {
  for (const [, member, value] of body.matchAll(/(\w+) = ('[^']*')/g)) {
    enumMembers.set(`${name}.${member}`, value);
  }
}

const resolveEnums = (type) =>
  type.replaceAll(/\b\w+\.\w+\b/g, (match) => enumMembers.get(match) ?? match);

const unquoteCode = (text) => text.replace(/^`(.*)`$/s, '$1');

/** Rows of the first Markdown table in a section, cells unescaped. */
const tableRows = (section) =>
  section
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .slice(2)
    .map((row) =>
      row
        .replaceAll(String.raw`\|`, '\u0000')
        .split('|')
        .slice(1, -1)
        .map((cell) => unquoteCode(cell.trim().replaceAll('\u0000', '|'))),
    );

const sectionsOf = (markdown) =>
  Object.fromEntries(
    markdown
      .split(/^## /m)
      .slice(1)
      .map((section) => {
        const [heading, ...body] = section.split('\n');

        return [heading.trim(), body.join('\n')];
      }),
  );

const REQUIRED = ' _(required)_';

const api = {};

for (const tag of tags) {
  const sections = sectionsOf(
    git('show', `${ref}:${componentsDir}/${tag}/readme.md`),
  );

  const entry = {};

  if (sections.Properties) {
    entry.props = tableRows(sections.Properties).map(
      ([property, attribute, , type, value]) => {
        const required = property.endsWith(REQUIRED);

        return {
          attribute: attribute === '--' ? null : attribute,
          default: value,
          property: unquoteCode(property.replace(REQUIRED, '')),
          ...(required && { required }),
          type: resolveEnums(type),
        };
      },
    );
  }

  if (sections.Events) {
    entry.events = tableRows(sections.Events).map(([name, , type]) => ({
      name,
      type,
    }));
  }

  if (sections.Methods) {
    entry.methods = [...sections.Methods.matchAll(/^### `(\w+)\(/gm)].map(
      ([, name]) => name,
    );
  }

  if (sections.Slots) {
    // The default slot is `''`, as in the 4.x manifest's `default`.
    entry.slots = tableRows(sections.Slots).map(([name]) => {
      const slot = name.replace(/^"(.*)"$/, '$1');

      return /^default( slot)?$/i.test(slot) ? '' : slot;
    });
  }

  if (sections['CSS Custom Properties']) {
    entry.cssProperties = tableRows(sections['CSS Custom Properties']).map(
      ([name]) => name,
    );
  }

  api[tag] = entry;
}

const commit = git('rev-parse', `${ref}^{commit}`).trim();

writeFileSync(
  outPath,
  `${JSON.stringify({ source: `${ref} (${commit})`, tags: api }, null, 2)}\n`,
);

console.log(`Wrote ${tags.length} tags from ${ref} to ${outPath}`);
