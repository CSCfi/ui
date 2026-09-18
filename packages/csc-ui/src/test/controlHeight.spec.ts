/**
 * The control height (CONTEXT.md, ADR-0055): the `default` field box, the
 * `default` c-button, the c-button-group frame and a c-tab share one resting
 * height — the `--spacing-control` theme value — so they line up in a form
 * row and a toolbar. The button scale sits around it: `small` below,
 * `large` at the toolbar height above.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle } from './harness';

const px = (value: string): number => Number.parseFloat(value);

// Theme values are emitted under `:root, :host` in each component's adopted
// sheet, so they resolve on a component host — not on the document.
const themeValue = (host: Element, name: string): number =>
  px(getComputedStyle(host).getPropertyValue(name));

describe('control height', () => {
  it('is one shared 52px value', async () => {
    const m = await mount('c-button', { html: 'Save' });

    expect(themeValue(m.host, '--spacing-control')).toBe(52);
    m.unmount();
  });

  it('the default field box, default button, button-group frame and tab are all the control height', async () => {
    const field = await mount('c-text-field', {
      attrs: { style: 'width: 240px' },
      props: { label: 'Name' },
    });

    const button = await mount('c-button', { html: 'Save' });

    const group = await mount('c-button-group', {
      html: '<c-button value="a">Day</c-button><c-button value="b">Week</c-button>',
    });

    const tabs = await mount('c-tabs', {
      html: '<c-tab value="one">One</c-tab><c-tab value="two">Two</c-tab>',
      props: { value: 'one' },
    });

    await settle();

    const expected = themeValue(button.host, '--spacing-control');

    expect(
      field.deep('c-input', '.c-input__slot').getBoundingClientRect().height,
      'field box',
    ).toBe(expected);
    expect(button.part('root').getBoundingClientRect().height, 'button').toBe(
      expected,
    );
    expect(
      group.part('root').getBoundingClientRect().height,
      'group frame',
    ).toBe(expected);
    expect(
      tabs.host.querySelector('c-tab')!.getBoundingClientRect().height,
      'tab',
    ).toBe(expected);

    for (const m of [field, button, group, tabs]) m.unmount();
  });

  it('the button scale sits around it: small below, large at the toolbar height', async () => {
    const small = await mount('c-button', {
      html: 'Save',
      props: { size: 'small' },
    });

    const large = await mount('c-button', {
      html: 'Save',
      props: { size: 'large' },
    });

    await settle();

    const control = themeValue(large.host, '--spacing-control');

    const toolbar = themeValue(large.host, '--spacing-toolbar');

    expect(small.part('root').getBoundingClientRect().height).toBeLessThan(
      control,
    );
    expect(large.part('root').getBoundingClientRect().height).toBe(toolbar);
    expect(toolbar).toBeGreaterThan(control);

    small.unmount();
    large.unmount();
  });
});
