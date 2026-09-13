/**
 * The registration table in `src/index.ts` is the single source of truth for
 * what the package registers. Read as source text (the node project has no
 * SFC pipeline) so the table, the component directories and the documented
 * registration order cannot drift apart.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

const srcDir = fileURLToPath(new URL('.', import.meta.url));

const source = readFileSync(`${srcDir}index.ts`, 'utf8');

const registered = [
  ...source.matchAll(/^\s*\['(c-[a-z-]+)',\s*C\w+\],?\s*$/gm),
].map((m) => m[1]);

const before = (first: string, second: string): void => {
  expect(registered, first).toContain(first);
  expect(registered, second).toContain(second);
  expect(
    registered.indexOf(first),
    `${first} registers before ${second}`,
  ).toBeLessThan(registered.indexOf(second));
};

it('registers exactly the component directories, once each', () => {
  const directories = readdirSync(`${srcDir}components`).filter((d) =>
    d.startsWith('c-'),
  );

  expect([...registered].sort()).toEqual(directories.sort());
  expect(new Set(registered).size).toBe(registered.length);
});

it('registers shadow-rendered children before the parents that render them', () => {
  before('c-button-group', 'c-tab-buttons');

  const dropdownStack = [
    'c-option-value',
    'c-option',
    'c-dropdown',
    'c-select',
    'c-autocomplete',
    'c-tree-select',
  ];

  dropdownStack.slice(1).forEach((tag, i) => before(dropdownStack[i], tag));

  for (const leaf of ['c-divider', 'c-menu-label', 'c-menu-item'])
    before(leaf, 'c-menu');

  for (const child of [
    'c-checkbox',
    'c-pagination',
    'c-menu',
    'c-icon-button',
    'c-icon',
    'c-button',
  ]) {
    before(child, 'c-data-table');
  }
});
