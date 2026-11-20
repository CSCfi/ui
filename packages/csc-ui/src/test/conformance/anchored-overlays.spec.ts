/**
 * Conformance suite, kind "anchored overlay component" (CONTEXT.md, ADR-0049):
 * every tag whose shadow root renders a `[popover]` panel opens through its
 * trigger, closes on Escape, light-dismisses where applicable, and cleans up
 * when removed while open.
 */
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { Mounted } from '../harness';

import { registeredTags } from '../../registry';
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

  for (const tag of registeredTags) {
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
//
// Where no placement fits, CSS Anchor Positioning shifts the panel back inside
// the viewport, margin box first, starting at the start edge when larger.
// Firefox's native layout does not shift yet (Bug 1924792), nor keep the last
// placement that fit, so where its panel runs off the viewport the fallback is
// held to the shift itself rather than to that placement.
const NO_PLACEMENT_FITS = new Set([
  'taller than the viewport',
  'wider than the viewport',
  'with no room on either side',
]);

interface PanelPlacement {
  /** The panel's margins: top, right, bottom, left. */
  margins: number[];

  /** The panel's border box: left, top, width, height. */
  rect: number[];
}

const rounded = (values: number[]): string =>
  values.map((v) => Math.round(v)).join(',');

/** One axis of the shift: the box's new start. */
const shiftAxis = (
  start: number,
  size: number,
  marginStart: number,
  marginEnd: number,
  viewport: number,
): number => {
  const outer = size + marginStart + marginEnd;

  const outerStart =
    outer >= viewport
      ? 0
      : Math.min(Math.max(start - marginStart, 0), viewport - outer);

  return outerStart + marginStart;
};

/**
 * `rect` shifted into the viewport with the component's own `margins` (the
 * fallback folds the gap into its offset and zeroes the margin, so pass the
 * native run's).
 */
const shiftedIntoViewport = (rect: number[], margins: number[]): string => {
  const [left, top, width, height] = rect;

  const [marginTop, marginRight, marginBottom, marginLeft] = margins;

  const { clientHeight, clientWidth } = document.documentElement;

  return rounded([
    shiftAxis(left, width, marginLeft, marginRight, clientWidth),
    shiftAxis(top, height, marginTop, marginBottom, clientHeight),
    width,
    height,
  ]);
};

describe.each(Object.keys(OVERLAY_RECIPES))(
  '%s without native anchor positioning',
  (tag) => {
    const recipe = OVERLAY_RECIPES[tag];

    // Sizes the open panel from a sheet adopted into its own shadow root,
    // where no Vue `:style` patch can wipe it.
    const sizePanel = (m: Mounted, css: string) => {
      const root = recipe.panel(m).getRootNode() as ShadowRoot;

      const sheet = new CSSStyleSheet();

      sheet.replaceSync(`[popover] { ${css} }`);
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    };

    // `before` runs after the mount, `after` once the panel is open.
    const SCENARIOS: Record<
      string,
      {
        after?: (m: Mounted) => void;
        before?: (m: Mounted) => Promise<void> | void;
      }
    > = {
      'after the page scrolls': {
        before: () => {
          const tall = document.createElement('div');

          tall.style.height = '200vh';
          document.body.append(tall);
        },
      },
      // `absolute`, not `fixed`: an anchor in a fixed box is placed by script
      // in every browser, which would leave nothing native to compare with.
      'crowded into the bottom-right corner': {
        before: (m) => {
          m.stage.style.cssText += ';position:absolute;right:0;bottom:0';
        },
      },
      'in the page flow': {},
      // No placement fits: natively the panel is shifted back inside the
      // viewport rather than left running off its edge.
      'taller than the viewport': {
        after: (m) => sizePanel(m, 'min-height: 120vh; max-height: none'),
      },
      'wider than the viewport': {
        after: (m) => sizePanel(m, 'min-width: 120vw; max-width: none'),
      },
      'with no room on either side': {
        after: (m) => sizePanel(m, 'min-width: 80vw; max-width: none'),
        before: (m) => {
          m.stage.style.cssText += ';position:absolute;left:50%;top:40%';
        },
      },
    };

    const panelRect = async (scenario: string): Promise<PanelPlacement> => {
      document.body.replaceChildren();
      window.scrollTo(0, 0);

      const m = await mount(recipe.mountTag ?? tag, recipe.mount);

      await SCENARIOS[scenario].before?.(m);
      await recipe.open(m);
      SCENARIOS[scenario].after?.(m);

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

      const style = getComputedStyle(panel);

      const margins = [
        style.marginTop,
        style.marginRight,
        style.marginBottom,
        style.marginLeft,
      ].map((value) => parseFloat(value));

      m.unmount();
      window.scrollTo(0, 0);

      return { margins, rect: [r.left, r.top, r.width, r.height] };
    };

    // ADR-0038: a designated trigger elsewhere in the document. No anchor
    // name reaches it, so its panel is placed by script in every browser
    // (ADR-0056, amended 2026-11-20), and must sit against it as native
    // places the panel of the same trigger slotted at the same spot.
    const TRIGGER_AT = 'position:absolute;left:300px;top:200px';

    /** The panel's border box from the trigger's top-left corner. */
    const fromTrigger = (panel: HTMLElement, trigger: Element): string => {
      for (const a of panel.getAnimations({ subtree: true })) a.finish();

      const p = panel.getBoundingClientRect();

      const t = trigger.getBoundingClientRect();

      return [p.left - t.left, p.top - t.top, p.width, p.height]
        .map((v) => Math.round(v))
        .join(',');
    };

    const openFrom = async (trigger: HTMLElement): Promise<void> => {
      if (tag === 'c-tooltip') await userEvent.hover(trigger);
      else await userEvent.click(trigger);
      await settle();
    };

    const withoutSlottedTrigger = (): string | undefined =>
      recipe.mount.html?.replace(
        /<c-button slot="trigger">.*?<\/c-button>/,
        '',
      );

    const designatedRect = async (): Promise<string> => {
      document.body.replaceChildren();

      const trigger = document.createElement('button');

      trigger.id = 'designated';
      trigger.textContent = 'Designated';
      trigger.style.cssText = TRIGGER_AT;
      document.body.append(trigger);

      const m = await mount(tag, {
        ...recipe.mount,
        html: withoutSlottedTrigger(),
        props: { ...recipe.mount.props, trigger: 'designated' },
      });

      await openFrom(trigger);

      const rect = fromTrigger(recipe.panel(m), trigger);

      m.unmount();

      return rect;
    };

    const slottedRect = async (): Promise<string> => {
      document.body.replaceChildren();

      const m = await mount(tag, {
        ...recipe.mount,
        html: `<button slot="trigger">Designated</button>${withoutSlottedTrigger()}`,
      });

      m.stage.style.cssText += `;${TRIGGER_AT};padding:0`;

      const trigger = m.host.querySelector('button')!;

      await openFrom(trigger);

      const rect = fromTrigger(recipe.panel(m), trigger);

      m.unmount();

      return rect;
    };

    it.runIf(['c-menu', 'c-popover', 'c-tooltip'].includes(tag))(
      'places the panel against a designated trigger as native does against a slotted one',
      async () => {
        expect(await designatedRect()).toBe(await slottedRect());
      },
    );

    // A component host such as c-button is `display: contents`: no box of
    // its own (an empty rect at 0,0), so the panel is placed against the box
    // it renders.
    it.runIf(['c-menu', 'c-popover', 'c-tooltip'].includes(tag))(
      'places the panel against a designated c-button as native does against a slotted one',
      async () => {
        const label =
          recipe.mount.html?.match(
            /<c-button slot="trigger">(.*?)<\/c-button>/,
          )?.[1] ?? '';

        const buttonOf = (host: Element): HTMLElement =>
          host.shadowRoot!.querySelector('button')!;

        document.body.replaceChildren();

        const at = document.createElement('div');

        at.style.cssText = TRIGGER_AT;
        at.innerHTML = `<c-button id="designated">${label}</c-button>`;
        document.body.append(at);
        await settle();

        const d = await mount(tag, {
          ...recipe.mount,
          html: withoutSlottedTrigger(),
          props: { ...recipe.mount.props, trigger: 'designated' },
        });

        const designatedButton = buttonOf(at.querySelector('c-button')!);

        await openFrom(designatedButton);

        const designated = fromTrigger(recipe.panel(d), designatedButton);

        d.unmount();
        document.body.replaceChildren();

        const s = await mount(tag, recipe.mount);

        s.stage.style.cssText += `;${TRIGGER_AT};padding:0`;

        const slottedButton = buttonOf(s.host.querySelector('c-button')!);

        await openFrom(slottedButton);

        expect(designated).toBe(fromTrigger(recipe.panel(s), slottedButton));

        s.unmount();
      },
    );

    it.each(Object.keys(SCENARIOS))(
      'places the panel as native does %s',
      async (scenario) => {
        const native = await panelRect(scenario);

        const restore = withoutAnchorPositioning();

        try {
          expect(supportsAnchorPositioning()).toBe(false);

          const fallback = await panelRect(scenario);

          const nativeShifted = shiftedIntoViewport(
            native.rect,
            native.margins,
          );

          expect(rounded(fallback.rect)).toBe(
            !recipe.scripted &&
              NO_PLACEMENT_FITS.has(scenario) &&
              nativeShifted !== rounded(native.rect)
              ? shiftedIntoViewport(fallback.rect, native.margins)
              : rounded(native.rect),
          );
        } finally {
          restore();
        }
      },
    );
  },
);

// Safari 26's native positioning misplaced a panel anchored in a box that
// does not scroll with the page — the docs' pinned toolbar, a designated
// trigger's fixed proxy — by the scroll distance (ADR-0056, amended
// 2026-11-20). Such a panel is placed by script in every browser, and stays
// on its trigger whether the page scrolls while it is open or before it.
describe.each(Object.keys(OVERLAY_RECIPES))(
  '%s where the page scrolls past its trigger',
  (tag) => {
    const recipe = OVERLAY_RECIPES[tag];

    /** Placed by `useFallbackPosition`: a pixel `left`, not `inset: auto`. */
    const placedByScript = (panel: HTMLElement): boolean =>
      panel.style.left.endsWith('px');

    /** The panel's border box from `from`'s top-left corner. */
    const offset = (panel: HTMLElement, from: Element): string => {
      for (const a of panel.getAnimations({ subtree: true })) a.finish();

      const p = panel.getBoundingClientRect();

      const f = from.getBoundingClientRect();

      return [p.left - f.left, p.top - f.top, p.width, p.height]
        .map((v) => Math.round(v))
        .join(',');
    };

    const scrollTo = async (y: number): Promise<void> => {
      window.scrollTo(0, y);
      await settle();
      await settle();

      expect(window.scrollY).toBe(y);
    };

    /** Page content below, so the page can scroll. */
    const tallPage = (): HTMLElement => {
      const tall = document.createElement('div');

      tall.style.height = '200vh';
      document.body.append(tall);

      return tall;
    };

    /**
     * Mounted in a pinned (sticky) stage, at the top of a tall page. The
     * pointer is parked away first: left resting on the last test's trigger,
     * it would open a tooltip on mount, before its stage is pinned.
     */
    const pinned = async (): Promise<Mounted> => {
      document.body.replaceChildren();
      window.scrollTo(0, 0);

      const away = document.createElement('div');

      away.style.cssText =
        'position:fixed;right:0;bottom:0;width:8px;height:8px';
      document.body.append(away);
      await userEvent.hover(away);
      away.remove();

      const m = await mount(recipe.mountTag ?? tag, recipe.mount);

      m.stage.style.cssText += ';position:sticky;top:0';
      tallPage();

      return m;
    };

    it('stays on a trigger in a pinned box as the page scrolls', async () => {
      const m = await pinned();

      try {
        await recipe.open(m);

        const panel = recipe.panel(m);

        expect(placedByScript(panel)).toBe(true);

        const before = offset(panel, m.stage);

        await scrollTo(40);

        expect(m.stage.getBoundingClientRect().top, 'the stage is pinned').toBe(
          0,
        );
        expect(offset(panel, m.stage)).toBe(before);
      } finally {
        m.unmount();
        window.scrollTo(0, 0);
      }
    });

    it('opens on a trigger in a pinned box after the page scrolls', async () => {
      const placed = async (y: number): Promise<string> => {
        const m = await pinned();

        try {
          await scrollTo(y);
          await recipe.open(m);

          const panel = recipe.panel(m);

          expect(placedByScript(panel), `at scrollY ${y}`).toBe(true);

          return offset(panel, m.stage);
        } finally {
          m.unmount();
          window.scrollTo(0, 0);
        }
      };

      const unscrolled = await placed(0);

      expect(await placed(40)).toBe(unscrolled);
    });

    it.runIf(['c-menu', 'c-popover', 'c-tooltip'].includes(tag))(
      'stays on a designated trigger as the page scrolls',
      async () => {
        document.body.replaceChildren();
        window.scrollTo(0, 0);

        const trigger = document.createElement('button');

        trigger.id = 'designated';
        trigger.textContent = 'Designated';
        trigger.style.cssText = 'margin:120px 0 0 300px';
        document.body.append(trigger);
        tallPage();

        const m = await mount(tag, {
          ...recipe.mount,
          html: recipe.mount.html?.replace(
            /<c-button slot="trigger">.*?<\/c-button>/,
            '',
          ),
          props: { ...recipe.mount.props, trigger: 'designated' },
        });

        try {
          if (tag === 'c-tooltip') await userEvent.hover(trigger);
          else await userEvent.click(trigger);
          await settle();

          const panel = recipe.panel(m);

          expect(placedByScript(panel)).toBe(true);

          const before = offset(panel, trigger);

          const top = trigger.getBoundingClientRect().top;

          await scrollTo(40);

          expect(trigger.getBoundingClientRect().top, 'the trigger moved').toBe(
            top - 40,
          );
          expect(offset(panel, trigger)).toBe(before);
        } finally {
          m.unmount();
          window.scrollTo(0, 0);
        }
      },
    );
  },
);
