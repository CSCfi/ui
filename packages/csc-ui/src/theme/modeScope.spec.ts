/**
 * Mode scope (CONTEXT.md "Mode scope", ADR-0053): `data-theme` on any element
 * pins a theme mode for that element and everything inside it. The cascade is
 * four selectors in `tokens.css`; these assert the behaviour they produce, and
 * that `themeMode()` stays a faithful mirror of it.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { OVERLAY_RECIPES } from '../test/conformance/kinds';
import {
  mount,
  parkPointer,
  settle,
  settled,
  VISUAL_BASELINES,
} from '../test/harness';
import { observeThemeMode, themeMode } from './themeMode';

/** The role that moves most between modes — white in light, slate-900 in dark. */
const PROBE = '--c-surface';

const read = (el: Element): string =>
  getComputedStyle(el).getPropertyValue(PROBE).trim();

const box = (theme?: string): HTMLDivElement => {
  const el = document.createElement('div');

  if (theme !== undefined) el.setAttribute('data-theme', theme);
  document.body.append(el);

  return el;
};

/** The two ground truths, read off `<html>` with each mode pinned there. */
const rootIn = (mode: 'dark' | 'light'): string => {
  const previous = document.documentElement.getAttribute('data-theme');

  document.documentElement.setAttribute('data-theme', mode);

  const value = read(document.documentElement);

  if (previous === null) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', previous);

  return value;
};

afterEach(() => {
  document.documentElement.setAttribute('data-theme', 'light');
  document.body.replaceChildren();
});

describe('the cascade', () => {
  it('pins dark inside a light document', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');

    expect(read(scope)).toBe(rootIn('dark'));
    expect(read(document.body)).toBe(rootIn('light'));
  });

  it('pins light inside a dark document', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const scope = box('light');

    expect(read(scope)).toBe(rootIn('light'));
  });

  it('lets the nearest scope win when scopes nest', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const outer = box('dark');
    const inner = document.createElement('div');

    inner.setAttribute('data-theme', 'light');

    const deepest = document.createElement('span');

    deepest.setAttribute('data-theme', 'dark');
    inner.append(deepest);
    outer.append(inner);

    expect(read(outer)).toBe(rootIn('dark'));
    expect(read(inner)).toBe(rootIn('light'));
    expect(read(deepest)).toBe(rootIn('dark'));
  });

  it('inherits through an element that pins no mode', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const plain = document.createElement('div');

    scope.append(plain);

    expect(read(plain)).toBe(rootIn('dark'));
  });

  it('ignores a data-theme value that is not light or dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    // A consumer's own theming system (DaisyUI, Nuxt Color Mode) must not
    // knock csc-ui out of the surrounding mode.
    const foreign = box('cupcake');

    expect(read(foreign)).toBe(rootIn('dark'));
    expect(themeMode(foreign)).toBe('dark');
  });

  it('follows the OS preference when the root pins an unknown value', () => {
    document.documentElement.setAttribute('data-theme', 'auto');

    const osDark = matchMedia('(prefers-color-scheme: dark)').matches;

    expect(read(document.documentElement)).toBe(
      rootIn(osDark ? 'dark' : 'light'),
    );
    expect(themeMode()).toBe(osDark ? 'dark' : 'light');
  });

  it('re-points tokens without painting, so an outside colour inherits in', () => {
    // The documented consequence of tokens-only scoping: a scope changes what
    // `--c-on-surface` RESOLVES to, but never declares `color`, so a `color`
    // already computed outside the scope inherits in as a literal. Container
    // authors opt into paint with `bg-surface text-on-surface`.
    document.documentElement.setAttribute('data-theme', 'light');

    const outside = box();

    outside.style.color = 'var(--c-on-surface)';

    const scope = document.createElement('div');

    scope.setAttribute('data-theme', 'dark');
    outside.append(scope);

    const lightInk = getComputedStyle(outside).color;

    expect(getComputedStyle(scope).color).toBe(lightInk);

    scope.style.color = 'var(--c-on-surface)';

    expect(getComputedStyle(scope).color).not.toBe(lightInk);
  });

  it('sets color-scheme so UA chrome follows the pinned mode', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');

    expect(getComputedStyle(scope).colorScheme).toBe('dark');
    expect(getComputedStyle(document.body).colorScheme).toBe('light');
  });
});

describe('themeMode()', () => {
  it('agrees with the computed token at every depth', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const plain = document.createElement('div');

    scope.append(plain);

    for (const el of [scope, plain]) {
      expect(themeMode(el), el.outerHTML).toBe('dark');
      expect(read(el)).toBe(rootIn('dark'));
    }

    expect(themeMode(document.body)).toBe('light');
  });

  it('resolves the root when called with no argument', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    expect(themeMode()).toBe('dark');
  });
});

describe('observeThemeMode()', () => {
  it('reports the current mode synchronously on subscribe', () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const onChange = vi.fn();

    const stop = observeThemeMode(scope, onChange);

    expect(onChange).toHaveBeenCalledExactlyOnceWith('dark');
    stop();
  });

  it('reports a flip on an ancestor that is not the document root', async () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const target = document.createElement('div');

    scope.append(target);

    const onChange = vi.fn();
    const stop = observeThemeMode(target, onChange);

    onChange.mockClear();

    scope.setAttribute('data-theme', 'light');
    await settle();

    expect(onChange).toHaveBeenCalledExactlyOnceWith('light');
    stop();
  });

  it('stays silent when the mode in effect did not change', async () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const onChange = vi.fn();
    const stop = observeThemeMode(scope, onChange);

    onChange.mockClear();

    // An unrelated scope elsewhere in the document, then a no-op rewrite.
    box('dark');
    scope.setAttribute('data-theme', 'dark');
    await settle();

    expect(onChange).not.toHaveBeenCalled();
    stop();
  });

  it('detaches on dispose', async () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const onChange = vi.fn();
    const stop = observeThemeMode(scope, onChange);

    stop();
    onChange.mockClear();

    scope.setAttribute('data-theme', 'light');
    await settle();

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('components', () => {
  it('paints a host that pins its own mode', async () => {
    document.documentElement.setAttribute('data-theme', 'light');

    const dark = await mount('c-button', { attrs: { 'data-theme': 'dark' } });
    const light = await mount('c-button');

    await settle();

    expect(getComputedStyle(dark.part('root')).backgroundColor).not.toBe(
      getComputedStyle(light.part('root')).backgroundColor,
    );
  });

  // The panel is promoted to the top layer by the Popover API, but it stays in
  // the DOM tree — so it still inherits the enclosing scope. If this regresses,
  // every overlay opened inside a mode scope paints the page's mode instead.
  it.each(Object.keys(OVERLAY_RECIPES))(
    'carries the scope into %s\u2019s top-layer panel',
    async (tag) => {
      document.documentElement.setAttribute('data-theme', 'light');

      const recipe = OVERLAY_RECIPES[tag];
      const m = await mount(recipe.mountTag ?? tag, recipe.mount);

      m.stage.setAttribute('data-theme', 'dark');
      await recipe.open(m);

      const panel = recipe.panel(m);

      expect(panel.matches(':popover-open'), `${tag} panel opened`).toBe(true);
      expect(read(panel)).toBe(rootIn('dark'));
    },
  );

  it('carries the scope into c-table’s light-DOM table', async () => {
    // c-table styles the consumer's table through an injected document sheet
    // (ADR-0037), not the shadow-adopted one — the one place library CSS
    // reaches the light DOM, and the one the token guards cannot see.
    document.documentElement.setAttribute('data-theme', 'light');

    const scope = box('dark');
    const host = document.createElement('c-table');

    host.innerHTML = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
    scope.append(host);

    await settle();

    const cell = host.querySelector('td')!;

    expect(read(cell)).toBe(rootIn('dark'));
  });
});

describe('visual', () => {
  it.skipIf(!VISUAL_BASELINES)(
    'renders a dark scope on a light page',
    async () => {
      document.documentElement.setAttribute('data-theme', 'light');

      const scope = box('dark');

      // The paint opt-in the customization guide prescribes: a mode scope
      // re-points colour and draws no background of its own.
      scope.style.cssText =
        'display:inline-block;padding:24px;background:var(--c-surface);color:var(--c-on-surface)';
      scope.innerHTML = `
        <c-card>
          <c-card-title>Dark scope</c-card-title>
          <c-card-content>
            <c-text-field label="Name" value="Ada"></c-text-field>
            <c-button>Save</c-button>
          </c-card-content>
        </c-card>`;

      await settled();
      await parkPointer();

      await expect
        .element(page.elementLocator(scope))
        .toMatchScreenshot('mode-scope-dark-on-light');
    },
  );
});
