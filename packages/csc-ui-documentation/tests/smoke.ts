/**
 * What every flavor of the example smoke shares (CONTEXT.md "Example smoke",
 * ADR-0049, ADR-0077): settling a mounted canon, catching console noise, the
 * upgrade checks, and the axe pass.
 */
import axe from 'axe-core';
import { expect } from 'vitest';

/** Two frames, then `ms` more: a canon's first render and its upgrade. */
export const settle = async (ms = 0): Promise<void> => {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
};

/** Canons whose data arrives on a timer (debounced external filter, simulated fetch). */
const TIMER_DRIVEN = new Set([
  'c-autocomplete/external',
  'c-data-table/external-data',
]);

/** How long a canon (`<tag>/<name>`) needs after mounting. */
export const settleTime = (name: string): number =>
  TIMER_DRIVEN.has(name) ? 700 : 100;

/** Collect `console.error` / `console.warn` calls until `restore()`. */
export const captureConsole = (): {
  problems: string[];
  restore: () => void;
} => {
  const problems: string[] = [];

  const originals = { error: console.error, warn: console.warn };

  console.error = (...args: unknown[]) =>
    problems.push(`console.error: ${args.join(' ')}`);
  console.warn = (...args: unknown[]) =>
    problems.push(`console.warn: ${args.join(' ')}`);

  return {
    problems,
    restore: () => {
      console.error = originals.error;
      console.warn = originals.warn;
    },
  };
};

/** Every `c-*` element under `root` is registered, upgraded and bound cleanly. */
export const expectUpgraded = (root: Element): void => {
  const elements = Array.from(root.querySelectorAll('*')).filter((el) =>
    el.localName.startsWith('c-'),
  );

  expect(
    elements.length,
    'the canon renders at least one c-* element',
  ).toBeGreaterThan(0);

  for (const el of elements) {
    expect(customElements.get(el.localName), el.localName).toBeDefined();
    expect(el.matches(':defined'), `${el.localName} upgraded`).toBe(true);
    expect(el.shadowRoot, `${el.localName} shadow root`).not.toBeNull();
    // A `:some-prop.prop` binding writes a dead own property instead of the
    // camelCase property the element declares.
    expect(
      Object.getOwnPropertyNames(el).filter((key) => key.includes('-')),
      `${el.localName} hyphenated own properties`,
    ).toEqual([]);
  }
};

const AXE_OPTIONS: axe.RunOptions = {
  resultTypes: ['violations'],
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },
};

/**
 * Take the docs' 320px box off every c-main in `root` until the returned
 * function puts it back. axe-core 4.14 files text slotted into a component
 * and that component's own shadow background under different scroll regions
 * when the scroller sits in an outer shadow root (its scroll-region lookup
 * stops at a shadow root), so `color-contrast` measured the toolbar and
 * drawer text against the canvas behind them. An app scrolls the document,
 * which axe does not count as a scroll region, so unboxed is how an app
 * shows c-main. `!important`: the page's `::part(root)` rule outranks an
 * inline style inside the shadow tree.
 */
const unboxMains = (root: Element): (() => void) => {
  const boxes = [...root.querySelectorAll('c-main')].flatMap((main) => {
    const box = main.shadowRoot?.querySelector<HTMLElement>('[part="root"]');

    return box ? [box] : [];
  });

  for (const box of boxes) {
    box.style.setProperty('overflow', 'visible', 'important');
  }

  return () => {
    for (const box of boxes) box.style.removeProperty('overflow');
  };
};

/**
 * axe (WCAG 2.1 AA, D14) over `root` in the light and the dark theme: rule
 * id → one line per failing node, naming the mode and the node's path
 * through the shadow roots.
 */
export const axeViolations = async (
  root: Element,
): Promise<Map<string, string[]>> => {
  const violations = new Map<string, string[]>();

  const rebox = unboxMains(root);

  for (const mode of ['light', 'dark'] as const) {
    document.documentElement.setAttribute('data-theme', mode);
    await settle(100);

    const { violations: found } = await axe.run(root, AXE_OPTIONS);

    for (const violation of found) {
      const lines = violations.get(violation.id) ?? [];

      for (const node of violation.nodes) {
        lines.push(
          `${mode} ${JSON.stringify(node.target)}: ${node.failureSummary?.split('\n').slice(1).join(' ').trim()}`,
        );
      }

      violations.set(violation.id, lines);
    }
  }

  document.documentElement.setAttribute('data-theme', 'light');
  rebox();

  return violations;
};
