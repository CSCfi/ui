/**
 * The control height (CONTEXT.md, ADR-0055): the `default` field box, the
 * `default` c-button, the c-button-group frame and a c-tab share one resting
 * height — the `--spacing-control` theme value — so they line up in a form
 * row and a toolbar. The button scale sits around it: `small` below,
 * `large` at the toolbar height above.
 */
import { describe, expect, it } from 'vitest';

import { mount, settle, settled } from './harness';

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

  // The resting label is absolutely positioned from a literal `top`, so it does
  // not follow the box the way the button's flex-centred glyph does. Centring
  // holds only while `top = (box - 24) / 2 + 2` — the 24px is text-base's own
  // line box, the +2 cancels the `translateY(-2px)` optical nudge in the
  // escape-hatch rule. Retuning `--spacing-control` without retuning `top`
  // de-centres the label, which is how it drifted 2px high at 52px.
  it('rests the floating label centred in the field box, at both sizes', async () => {
    for (const [size, height] of [
      ['default', 52],
      ['small', 36],
    ] as const) {
      // `size` goes on the host attribute, not the property: a defaultable
      // prop resolves attribute-first (ADR-0048, src/shared/appDefaults.ts)
      // and a property write only reflects to the attribute on connect.
      const m = await mount('c-text-field', {
        attrs: { size, style: 'width: 240px' },
        props: { label: 'Name' },
      });

      await settled();

      const label = m.deep('c-input', '.c-input__label--floating');

      const labelBox = label.getBoundingClientRect();

      const slot = m
        .deep('c-input', '.c-input__slot')
        .getBoundingClientRect();

      expect(slot.height, `${size} box`).toBe(height);
      // Empty and unfocused: the label rests inside the box, not lifted onto
      // the border, so this measures the resting geometry.
      expect(label.hasAttribute('data-lifted'), `${size} resting`).toBe(false);
      expect(
        Math.abs(
          (labelBox.top + labelBox.bottom) / 2 - (slot.top + slot.bottom) / 2,
        ),
        `${size} label centred in the box`,
      ).toBeLessThanOrEqual(1);

      m.unmount();
    }
  });
});
