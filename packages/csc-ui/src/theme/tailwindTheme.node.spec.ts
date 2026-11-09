/**
 * The consumer Tailwind theme (ADR-0018) maps every semantic token, and only
 * those. It is hand-written beside the token maps, so a new token can ship
 * with no utility: the four `inverse-*` tokens of ADR-0079 did.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const read = (path: string): string =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

const roles = new Set(
  ['light', 'dark', 'invariant'].flatMap((map) =>
    Object.keys(
      JSON.parse(read(`../../tokens/semantic/${map}.json`)) as object,
    ).filter((key) => !key.startsWith('_')),
  ),
);

const mapped = new Map(
  [
    ...read('../styles/css/tailwind-theme.css').matchAll(
      /--color-([a-z0-9-]+):\s*var\(--c-([a-z0-9-]+)\)/g,
    ),
  ].map(([, utility, role]) => [utility!, role!]),
);

it('maps every semantic token to a utility of its own name', () => {
  expect([...roles].filter((role) => mapped.get(role) !== role)).toEqual([]);
});

it('maps nothing that is not a semantic token', () => {
  expect([...mapped.values()].filter((role) => !roles.has(role))).toEqual([]);
});
