import { describe, expect, it } from 'vitest';

import type { Mounted } from '../test/harness';

import { DEFAULTABLE_PROPS } from '../tag-name-map';
import { mount, settle } from '../test/harness';
import { applyDefaults, resetDefaults } from './appDefaults';

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

describe('at the element (ADR-0048, _plan/app-defaults.md verification cases)', () => {
  const input = (m: Mounted): HTMLElement => m.shadow('c-input');

  it('an unset defaultable prop resolves to the built-in and reflects no attribute', async () => {
    const m = await mount('c-text-field', { props: { label: 'Name' } });

    expect(input(m).hasAttribute('label-on-top')).toBe(false);
    expect(m.host.hasAttribute('size')).toBe(false);
  });

  it('applyDefaults flips a mounted field live; undefined clears; resetDefaults restores', async () => {
    const m = await mount('c-text-field', { props: { label: 'Name' } });

    applyDefaults({ 'c-text-field': { labelOnTop: true } });
    await settle();

    expect(input(m).hasAttribute('label-on-top')).toBe(true);

    applyDefaults({ 'c-text-field': { labelOnTop: undefined } });
    await settle();

    expect(input(m).hasAttribute('label-on-top')).toBe(false);

    applyDefaults({ 'c-text-field': { labelOnTop: true } });
    await settle();
    resetDefaults();
    await settle();

    expect(input(m).hasAttribute('label-on-top')).toBe(false);
  });

  it('an explicit attribute or property beats the app default; undefined falls back to it', async () => {
    applyDefaults({ 'c-text-field': { labelOnTop: true } });

    const byAttribute = await mount('c-text-field', {
      attrs: { 'label-on-top': 'false' },
      props: { label: 'A' },
    });

    const byProperty = await mount<{ labelOnTop?: boolean } & HTMLElement>(
      'c-text-field',
      {
        props: { label: 'B', labelOnTop: false },
      },
    );

    expect(input(byAttribute).hasAttribute('label-on-top')).toBe(false);
    expect(input(byProperty).hasAttribute('label-on-top')).toBe(false);

    byProperty.host.labelOnTop = undefined;
    await settle();

    expect(input(byProperty).hasAttribute('label-on-top')).toBe(true);
  });

  it('hide-details reaches the inner field through data-hide-details and survives value changes', async () => {
    const m = await mount<{ value: unknown } & HTMLElement>('c-select', {
      attrs: { 'hide-details': true },
      html: '<c-option value="a">A</c-option><c-option value="b">B</c-option>',
      props: { label: 'Pick' },
    });

    expect(input(m).getAttribute('data-hide-details')).toBe('true');

    m.host.value = 'a';
    await settle();
    m.host.value = 'b';
    await settle();

    expect(input(m).getAttribute('data-hide-details')).toBe('true');

    const byDefault = await mount('c-select', { props: { label: 'Pick' } });

    const overridden = await mount('c-select', {
      attrs: { 'hide-details': 'false' },
      props: { label: 'Pick' },
    });

    applyDefaults({ 'c-select': { hideDetails: true } });
    await settle();

    expect(input(byDefault).getAttribute('data-hide-details')).toBe('true');
    expect(input(overridden).getAttribute('data-hide-details')).toBe('false');
  });

  it('texts merge per key: built-in ← app default ← own', async () => {
    applyDefaults({ 'c-select': { texts: { toggleOptions: 'Vaihda' } } });

    const m = await mount<{ value: unknown } & HTMLElement>('c-select', {
      html: '<c-option value="a">A</c-option>',
      props: {
        clearable: true,
        label: 'Pick',
        texts: { clearSelection: 'Tyhjennä' },
        value: 'a',
      },
    });

    const labels = () =>
      Array.from(m.host.shadowRoot!.querySelectorAll('c-icon-button')).map(
        (b) => b.getAttribute('aria-label'),
      );

    // With a selection the clear button stands in for the chevron: own text.
    expect(labels()).toContain('Tyhjennä');

    m.host.value = null;
    await settle();

    // Cleared: the chevron is back, carrying the app-default text.
    expect(labels()).toContain('Vaihda');
  });
});
