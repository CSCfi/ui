/**
 * Conformance suite, kind "anchored overlay component" (CONTEXT.md, ADR-0049):
 * every tag whose shadow root renders a `[popover]` panel opens through its
 * trigger, closes on Escape, light-dismisses where applicable, and cleans up
 * when removed while open.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { migratedTags } from '../../index';
import { deepActiveElement, mount, settle } from '../harness';
import { FIXTURES, KNOWN_FOCUS_LOSS_ON_CLOSE, OVERLAY_RECIPES } from './kinds';

const within = (home: Element, active: Element | null): boolean =>
  active !== null &&
  (home === active ||
    home.contains(active) ||
    (home.shadowRoot?.contains(active) ?? false));

it('every anchored overlay component has a recipe', async () => {
  const detected: string[] = [];

  for (const tag of migratedTags) {
    const m = await mount(tag, FIXTURES[tag]);

    if (m.host.shadowRoot!.querySelector('[popover]')) detected.push(tag);

    m.unmount();
  }

  expect(detected.sort()).toEqual(Object.keys(OVERLAY_RECIPES).sort());
});

describe.each(Object.keys(OVERLAY_RECIPES))('%s', (tag) => {
  const recipe = OVERLAY_RECIPES[tag];

  const setup = () => mount(recipe.mountTag ?? tag, recipe.mount);

  it('opens through its trigger into the top layer', async () => {
    const m = await setup();

    await recipe.open(m);

    expect(recipe.panel(m).matches(':popover-open')).toBe(true);
  });

  it('closes on Escape and leaves focus at home', async () => {
    const m = await setup();

    await recipe.open(m);

    const activeBefore = deepActiveElement();

    await userEvent.keyboard('{Escape}');
    await settle();

    expect(recipe.panel(m).matches(':popover-open')).toBe(false);

    const home = recipe.focusHome(m);

    const active = deepActiveElement();

    if (home && KNOWN_FOCUS_LOSS_ON_CLOSE.includes(tag)) {
      expect(
        within(home, active),
        'deviation fixed — remove the tag from KNOWN_FOCUS_LOSS_ON_CLOSE',
      ).toBe(false);
    } else if (home) {
      expect(
        within(home, active),
        `focus on <${active?.localName}> instead of <${home.localName}>`,
      ).toBe(true);
    } else {
      expect(active).toBe(activeBefore);
    }

    recipe.afterEscape?.(m);
  });

  it.runIf(recipe.lightDismiss)(
    'closes on an outside pointerdown',
    async () => {
      const m = await setup();

      const outside = document.createElement('button');

      outside.textContent = 'outside';
      document.body.append(outside);

      await recipe.open(m);
      await userEvent.click(outside);
      await settle();

      expect(recipe.panel(m).matches(':popover-open')).toBe(false);
    },
  );

  it('leaves nothing open or listening when removed while open', async () => {
    const m = await setup();

    await recipe.open(m);

    const panel = recipe.panel(m);

    m.unmount();
    await settle();

    expect(panel.matches(':popover-open')).toBe(false);
    expect(() =>
      document.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true }),
      ),
    ).not.toThrow();
    expect(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }),
      ),
    ).not.toThrow();
  });
});
