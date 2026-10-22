/**
 * Conformance suite, kind "all components" (CONTEXT.md, ADR-0049): the
 * contract every registered tag honours, enrolled from `migratedTags`.
 */
import { describe, expect, it } from 'vitest';

import { migratedTags } from '../../index';
import { BENIGN_BROWSER_NOTICES, consoleSpy, mount, settle } from '../harness';
import { FIXTURES, NO_ROOT_PART } from './kinds';

const HOST_ATTRIBUTES = ['role', 'tabindex', 'id'] as const;

/**
 * A page with typography no default would produce (CONTEXT.md "Page
 * typography", ADR-0072), plus two Tailwind theme variables a consumer's own
 * theme may declare.
 */
const PAGE_TYPOGRAPHY: Record<string, string> = {
  '--font-sans': '"Page Probe"',
  '--spacing': '3px',
  'font-family': '"Page Probe", monospace',
  'font-feature-settings': '"tnum"',
  'font-variation-settings': '"wght" 450',
  'line-height': '1.7',
  'tab-size': '7',
};

/** The library's own custom-property namespaces, plus Tailwind's non-inheriting internals. */
const OWN_PROPERTY = /^--(?:_?c-|tw-)/;

const customProperties = (style: CSSStyleDeclaration): Map<string, string> =>
  new Map(
    [...style]
      .filter((name) => name.startsWith('--'))
      .map((name) => [name, style.getPropertyValue(name)]),
  );

describe.each(migratedTags)('%s', (tag) => {
  it('upgrades into a shadow root', async () => {
    const { host } = await mount(tag, FIXTURES[tag]);

    expect(customElements.get(tag)).toBeDefined();
    expect(host.matches(':defined')).toBe(true);
    expect(host.shadowRoot).not.toBeNull();
  });

  it('mounts and disconnects without console output', async () => {
    const m = await mount(tag, FIXTURES[tag]);

    m.unmount();
    await settle();

    const output = consoleSpy
      .records()
      .filter(
        (r) => !BENIGN_BROWSER_NOTICES.some((pattern) => pattern.test(r.text)),
      );

    expect(output).toEqual([]);
  });

  it('renders the root part unless it is a documented exception', async () => {
    const { host } = await mount(tag, FIXTURES[tag]);

    const hasRoot = host.shadowRoot!.querySelector('[part~="root"]') !== null;

    expect(
      hasRoot,
      `NO_ROOT_PART lists ${tag}: ${NO_ROOT_PART.includes(tag)}`,
    ).toBe(!NO_ROOT_PART.includes(tag));
  });

  it('does not duplicate host role, tabindex or id onto the root part', async () => {
    const { host } = await mount(tag, FIXTURES[tag]);

    const root = host.shadowRoot!.querySelector('[part~="root"]');

    if (!root) return;

    for (const name of HOST_ATTRIBUTES) {
      if (!host.hasAttribute(name)) continue;

      expect(
        root.getAttribute(name),
        `${name} leaked onto [part=root]`,
      ).not.toBe(host.getAttribute(name));
    }
  });

  it('passes the page typography through the host', async () => {
    const { host, stage } = await mount(tag, FIXTURES[tag]);

    for (const [name, value] of Object.entries(PAGE_TYPOGRAPHY)) {
      stage.style.setProperty(name, value);
    }

    const page = getComputedStyle(stage);

    const own = getComputedStyle(host);

    for (const name of Object.keys(PAGE_TYPOGRAPHY)) {
      expect(own.getPropertyValue(name), name).toBe(
        page.getPropertyValue(name),
      );
    }

    const pageProperties = customProperties(page);

    const declared = [...customProperties(own)]
      .filter(([name, value]) => pageProperties.get(name) !== value)
      .map(([name]) => name)
      .filter((name) => !OWN_PROPERTY.test(name));

    expect(declared, 'custom properties declared on the host').toEqual([]);
  });

  it('adopts shared stylesheets instead of inline <style> elements', async () => {
    const { host } = await mount(tag, FIXTURES[tag]);

    expect(host.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThanOrEqual(
      1,
    );
    expect(host.shadowRoot!.querySelector('style')).toBeNull();
  });
});
