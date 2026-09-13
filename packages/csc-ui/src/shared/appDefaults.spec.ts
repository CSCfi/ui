import { expect, it } from 'vitest';

import { DEFAULTABLE_PROPS } from '../tag-name-map';
import { applyDefaults } from './appDefaults';

it('rejects a tag without defaultable props', () => {
  expect(() => applyDefaults({ 'c-nope': {} } as never)).toThrow(
    /has no defaultable props/,
  );
});

it('rejects a prop that is not defaultable', () => {
  expect(() =>
    applyDefaults({ 'c-text-field': { placeholder: 'x' } } as never),
  ).toThrow(/"placeholder" is not a defaultable prop of <c-text-field>/);
});

it('validates before touching state, so a bad call leaves earlier defaults alone', () => {
  applyDefaults({ 'c-text-field': { labelOnTop: true } });

  expect(() =>
    applyDefaults({
      'c-nope': {},
      'c-text-field': { labelOnTop: false },
    } as never),
  ).toThrow();
});

it('the wave-1 allow-list is exactly the documented tags', () => {
  expect(Object.keys(DEFAULTABLE_PROPS).sort()).toEqual([
    'c-autocomplete',
    'c-data-table',
    'c-select',
    'c-text-field',
    'c-tree-select',
  ]);
});
