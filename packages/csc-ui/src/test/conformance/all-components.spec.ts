/**
 * Conformance suite, kind "all components" (CONTEXT.md, ADR-0049): the
 * contract every registered tag honours, enrolled from `migratedTags`.
 */
import { describe, expect, it } from 'vitest';

import { migratedTags } from '../../index';
import { BENIGN_BROWSER_NOTICES, consoleSpy, mount, settle } from '../harness';
import { FIXTURES, NO_ROOT_PART } from './kinds';

const HOST_ATTRIBUTES = ['role', 'tabindex', 'id'] as const;

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

  it('adopts shared stylesheets instead of inline <style> elements', async () => {
    const { host } = await mount(tag, FIXTURES[tag]);

    expect(host.shadowRoot!.adoptedStyleSheets.length).toBeGreaterThanOrEqual(
      1,
    );
    expect(host.shadowRoot!.querySelector('style')).toBeNull();
  });
});
