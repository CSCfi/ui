/**
 * The React wrapper sets props as DOM properties (ADR-0019). `@lit/react`
 * routes a prop to the element only when the element class's prototype names
 * it, and a Vue custom element defines its props on the instance, so before
 * the wrappers listed them, arrays, objects and functions reached the element
 * as `[object Object]` attributes.
 */
import { CAutocomplete, CDataTable, CSelect } from '@cscfi/csc-ui-react';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { settle } from './smoke';

const mounted: Array<() => void> = [];

const render = async (
  element: ReturnType<typeof createElement>,
  tag: string,
): Promise<HTMLElement & Record<string, unknown>> => {
  const root = document.createElement('div');

  document.body.append(root);

  const reactRoot = createRoot(root);

  mounted.push(() => {
    reactRoot.unmount();
    root.remove();
  });

  flushSync(() => reactRoot.render(element));
  await settle();

  return root.querySelector(tag)!;
};

afterEach(() => {
  for (const unmount of mounted.splice(0)) unmount();
});

describe('react props', () => {
  it('sets arrays and render functions as properties', async () => {
    const cell = () => 'cell';

    const columns = [{ cell, key: 'name' }];

    const data = [{ name: 'Ada' }];

    const element = await render(
      createElement(CDataTable, { columns, data }),
      'c-data-table',
    );

    expect(element.columns).toBe(columns);
    expect(element.data).toBe(data);
    expect(element.hasAttribute('columns')).toBe(false);
    expect(element.shadowRoot!.textContent).toContain('cell');
  });

  it('sets item arrays as properties', async () => {
    const items = [{ name: 'One', value: 1 }];

    const element = await render(createElement(CSelect, { items }), 'c-select');

    expect(element.items).toBe(items);
    expect(element.hasAttribute('items')).toBe(false);
  });

  it('sets texts objects with functions as properties', async () => {
    const texts = {
      noResults: 'Nothing',
      selected: (count: number) => `${count}`,
    };

    const element = await render(
      createElement(CAutocomplete, { texts }),
      'c-autocomplete',
    );

    expect(element.texts).toBe(texts);
    expect(element.hasAttribute('texts')).toBe(false);
  });
});
