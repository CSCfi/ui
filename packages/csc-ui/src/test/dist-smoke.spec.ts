/**
 * The one spec that exercises the BUILT bundle (ADR-0049): bundling-only
 * faults — a `process` reference, a dropped export, a broken shared sheet —
 * never show in source-mode specs. Skips when `dist/` is absent locally;
 * CI always builds first and requires it.
 */
import { describe, expect, it } from 'vitest';

import type * as CscUi from '../index';

const distModules = import.meta.glob<typeof CscUi>('../../dist/csc-ui.js');

const load = Object.values(distModules)[0];

interface Manifest {
  csc?: { internalTags?: string[] };
  modules: { declarations?: { tagName?: string }[] }[];
}

const manifests = import.meta.glob<Manifest>(
  '../../dist/custom-elements.json',
  {
    eager: true,
    import: 'default',
  },
);

/** Every tag the built manifest names: the public ones and the internal ones. */
const builtTags = (): string[] => {
  const manifest = Object.values(manifests)[0];

  if (!manifest) return [];

  return [
    ...manifest.modules.flatMap((m) =>
      (m.declarations ?? []).flatMap((d) => (d.tagName ? [d.tagName] : [])),
    ),
    ...(manifest.csc?.internalTags ?? []),
  ];
};

const PUBLIC_EXPORTS = [
  'DEFAULTABLE_PROPS',
  'DEFAULT_SEEDS',
  'FAMILIES',
  'applyDefaults',
  'applyTheme',
  'defineCustomElements',
  'observeThemeMode',
  'resetDefaults',
  'resetTheme',
  'themeMode',
  'themeToCss',
] as const;

describe.skipIf(!load && !__CSC_REQUIRE_DIST__)('dist/csc-ui.js', () => {
  it('is built (CI requires it; locally run `pnpm build`)', () => {
    expect(load, 'dist/csc-ui.js missing — run `pnpm build`').toBeDefined();
  });

  it('starts from a registry the source build has not touched', () => {
    expect(customElements.get('c-button')).toBeUndefined();
  });

  it('exposes the public runtime API', async () => {
    const mod = await load!();

    for (const name of PUBLIC_EXPORTS) expect(mod[name], name).toBeDefined();
  });

  it('upgrades every tag of the built manifest, idempotently', async () => {
    const mod = await load!();
    mod.defineCustomElements();
    expect(() => mod.defineCustomElements()).not.toThrow();

    const tags = builtTags();
    expect(
      tags.length,
      'dist/custom-elements.json lists no tag',
    ).toBeGreaterThan(0);

    for (const tag of tags) {
      expect(customElements.get(tag), tag).toBeDefined();

      const el = document.createElement(tag);
      document.body.append(el);
      await customElements.whenDefined(tag);
      expect(el.shadowRoot, `${tag} shadow root`).not.toBeNull();
      expect(el.matches(':defined'), `${tag} :defined`).toBe(true);
    }
  });

  it('registers the Tailwind @property rules once in document.head', async () => {
    const mod = await load!();
    mod.defineCustomElements();

    for (let i = 0; i < 20; i += 1)
      document.body.append(document.createElement('c-button'));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const styles = document.head.querySelectorAll(
      'style[data-csc-ui-tw-properties]',
    );
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toMatch(/@property\s+--[\w-]+/);
  });

  it('shares one Tailwind sheet across hosts and adds one SFC sheet per tag', async () => {
    const mod = await load!();
    mod.defineCustomElements();

    const [a, b, s] = ['c-button', 'c-button', 'c-switch'].map((tag) => {
      const el = document.createElement(tag);
      document.body.append(el);

      return el;
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const sheets = (el: Element): CSSStyleSheet[] =>
      Array.from(el.shadowRoot!.adoptedStyleSheets);
    expect(sheets(a)[0]).toBe(sheets(b)[0]);
    expect(sheets(a)[0]).toBe(sheets(s)[0]);
    expect(sheets(s).length).toBeGreaterThan(1);
    expect(sheets(s)[1]).not.toBe(sheets(s)[0]);

    for (const el of [a, b, s])
      expect(el.shadowRoot!.querySelector('style')).toBeNull();

    const shared = sheets(a)[0];

    const hostRule = Array.from(shared.cssRules).find(
      (rule) => rule instanceof CSSStyleRule && rule.selectorText === ':host',
    ) as CSSStyleRule | undefined;
    expect(hostRule?.style.display).toBe('contents');
  });
});
