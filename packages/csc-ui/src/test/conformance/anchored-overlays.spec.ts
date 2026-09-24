/**
 * Conformance suite, kind "anchored overlay component" (CONTEXT.md, ADR-0049):
 * every tag whose shadow root renders a `[popover]` panel opens through its
 * trigger, closes on Escape, light-dismisses where applicable, and cleans up
 * when removed while open.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../harness';

import { migratedTags } from '../../index';
import { supportsAnchorPositioning } from '../../shared/useFallbackPosition';
import { deepActiveElement, mount, settle } from '../harness';
import { withoutAnchorPositioning } from '../noAnchorPositioning';
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
    'light-dismisses on an outside press and release',
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

  // CONTEXT.md "Light dismiss", ADR-0050: a touch scroll is a press that ends
  // in `pointercancel`; it must leave the panel open, as it does for a native
  // `popover="auto"`.
  it.runIf(recipe.lightDismiss)(
    'survives a scroll gesture that starts outside',
    async () => {
      const m = await setup();

      const outside = document.createElement('div');

      outside.style.cssText = 'height:200px';
      document.body.append(outside);

      await recipe.open(m);

      const gesture = (type: string): void => {
        outside.dispatchEvent(
          new PointerEvent(type, {
            bubbles: true,
            composed: true,
            isPrimary: true,
            pointerId: 1,
            pointerType: 'touch',
          }),
        );
      };

      gesture('pointerdown');
      await settle();

      expect(
        recipe.panel(m).matches(':popover-open'),
        'closed on the press alone',
      ).toBe(true);

      gesture('pointercancel');
      await settle();

      expect(recipe.panel(m).matches(':popover-open')).toBe(true);
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

// Firefox 140 ESR has no CSS anchor positioning (ADR-0056): the panel must
// land where the native engine puts it — flips and scroll-tracking included —
// through the non-native path, measured against a native run of the same
// scenario in the same page.
describe.each(Object.keys(OVERLAY_RECIPES))(
  '%s without native anchor positioning',
  (tag) => {
    const recipe = OVERLAY_RECIPES[tag];

    const SCENARIOS: Record<string, (m: Mounted) => Promise<void> | void> = {
      'after the page scrolls': () => {
        const tall = document.createElement('div');

        tall.style.height = '200vh';
        document.body.append(tall);
      },
      'crowded into the bottom-right corner': (m) => {
        m.stage.style.cssText += ';position:fixed;right:0;bottom:0';
      },
      'in the page flow': () => {},
    };

    const panelRect = async (scenario: string): Promise<string> => {
      document.body.replaceChildren();
      window.scrollTo(0, 0);

      const m = await mount(recipe.mountTag ?? tag, recipe.mount);

      await SCENARIOS[scenario](m);
      await recipe.open(m);

      if (scenario === 'after the page scrolls') {
        window.scrollTo(0, 40);
        await settle();
      }

      await settle();

      const panel = recipe.panel(m);

      // The open animation's transform would skew the rect by the frame the
      // measurement lands on.
      for (const a of panel.getAnimations({ subtree: true })) a.finish();

      const r = panel.getBoundingClientRect();

      const out = [r.left, r.top, r.width, r.height]
        .map((v) => Math.round(v))
        .join(',');

      m.unmount();
      window.scrollTo(0, 0);

      return out;
    };

    // ADR-0038: a designated trigger elsewhere in the document; natively the
    // panel anchors to a tracked proxy, without the feature to the element.
    const designatedRect = async (): Promise<string> => {
      document.body.replaceChildren();

      const trigger = document.createElement('button');

      trigger.id = 'designated';
      trigger.textContent = 'Designated';
      trigger.style.cssText = 'position:fixed;left:300px;top:200px';
      document.body.append(trigger);

      const m = await mount(tag, {
        ...recipe.mount,
        html: recipe.mount.html?.replace(
          /<c-button slot="trigger">.*?<\/c-button>/,
          '',
        ),
        props: { ...recipe.mount.props, trigger: 'designated' },
      });

      if (tag === 'c-tooltip') await userEvent.hover(trigger);
      else await userEvent.click(trigger);
      await settle();

      const panel = recipe.panel(m);

      for (const a of panel.getAnimations({ subtree: true })) a.finish();

      const r = panel.getBoundingClientRect();

      m.unmount();

      return [r.left, r.top, r.width, r.height]
        .map((v) => Math.round(v))
        .join(',');
    };

    it.runIf(['c-menu', 'c-popover', 'c-tooltip'].includes(tag))(
      'places the panel as native does against a designated trigger',
      async () => {
        const native = await designatedRect();

        const restore = withoutAnchorPositioning();

        try {
          expect(await designatedRect()).toBe(native);
        } finally {
          restore();
        }
      },
    );

    it.each(Object.keys(SCENARIOS))(
      'places the panel as native does %s',
      async (scenario) => {
        const native = await panelRect(scenario);

        const restore = withoutAnchorPositioning();

        try {
          expect(supportsAnchorPositioning()).toBe(false);
          expect(await panelRect(scenario)).toBe(native);
        } finally {
          restore();
        }
      },
    );
  },
);
