/**
 * Conformance suite, kind "all components" (CONTEXT.md, ADR-0049): the
 * contract every registered tag honours, enrolled from `registeredTags`.
 */
import { describe, expect, it } from 'vitest';

import { registeredTags } from '../../registry';
import { BENIGN_BROWSER_NOTICES, consoleSpy, mount, settle } from '../harness';
import {
  FIXTURES,
  HOST_ARIA_OBJECT,
  NO_ARIA_OBJECT,
  NO_ROOT_PART,
} from './kinds';

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

type Reflecting = {
  ariaDescribedByElements?: null | readonly Element[];
  ariaLabelledByElements?: null | readonly Element[];
} & Element;

/** What can carry an accessible object: a native control or landmark, or a role. */
const ROLE_BEARING =
  'a, article, button, dialog, input, main, nav, progress, table, textarea, [role]';

const deepElements = (root: ShadowRoot): Element[] =>
  [...root.querySelectorAll('*')].flatMap((el) => [
    el,
    ...(el.shadowRoot ? deepElements(el.shadowRoot) : []),
  ]);

it('lists only registered tags as exceptions to id-reference forwarding', () => {
  const listed = [...HOST_ARIA_OBJECT, ...NO_ARIA_OBJECT];

  expect(listed.filter((tag) => !registeredTags.includes(tag))).toEqual([]);
  expect(new Set(listed).size).toBe(listed.length);
});

describe.each(registeredTags)('%s', (tag) => {
  it('upgrades into a shadow root', async () => {
    const { host } = await mount(tag, FIXTURES[tag]);

    expect(customElements.get(tag)).toBeDefined();
    expect(host.matches(':defined')).toBe(true);
    expect(host.shadowRoot).not.toBeNull();
  });

  // `display: contents` (and a component's own `:host` box) is author CSS,
  // which beats the UA's `[hidden]` rule (decisions #15).
  it('is hidden by a hidden attribute, as any element is', async () => {
    const fixture = FIXTURES[tag] ?? {};

    const { host } = await mount(tag, {
      ...fixture,
      attrs: { ...fixture.attrs, hidden: true },
    });

    expect(getComputedStyle(host).display).toBe('none');
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

  // A host attribute that falls through to the shadow DOM keeps its name: a
  // camelized `ariaHaspopup` lands as a junk `ariahaspopup` attribute, and on
  // an `<svg>` root as a literal `ariaLabel`. A data attribute stays on the
  // host: a copy inside would make `[data-test="…"]` match twice. So does an
  // ARIA id reference: inside the shadow root its id points at nothing.
  it('keeps data attributes and id references on the host and forwards no mangled name', async () => {
    const fixture = FIXTURES[tag] ?? {};

    const { host } = await mount(tag, {
      ...fixture,
      attrs: {
        ...fixture.attrs,
        'aria-controls': 'probe-panel',
        'aria-roledescription': 'probe',
        'data-probe': 'probe',
      },
    });

    const unwanted = new Set([
      'ariaroledescription',
      'data-probe',
      'dataprobe',
    ]);

    const walk = (root: ShadowRoot): string[] =>
      [...root.querySelectorAll('*')].flatMap((element) => [
        ...[...element.attributes]
          .filter(
            ({ name, value }) =>
              unwanted.has(name.toLowerCase()) || value === 'probe-panel',
          )
          .map(({ name }) => name),
        ...(element.shadowRoot ? walk(element.shadowRoot) : []),
      ]);

    expect(walk(host.shadowRoot!)).toEqual([]);
  });

  // An id the page wrote names nothing inside the shadow root, so the element
  // that carries the tag's role gets the elements the host's ids name (ARIA
  // element reflection, ADR-0078) — unless the host is that element, or the
  // tag has nothing a page names by id (`aria-object.ts`).
  it('hands its id references to the element that carries its role', async () => {
    const fixture = FIXTURES[tag] ?? {};

    const label = Object.assign(document.createElement('span'), {
      id: 'probe-label',
      textContent: 'Probe label',
    });

    const hint = Object.assign(document.createElement('span'), {
      id: 'probe-hint',
      textContent: 'Probe hint',
    });

    document.body.append(label, hint);

    try {
      const { host } = await mount(tag, {
        ...fixture,
        attrs: {
          ...fixture.attrs,
          'aria-describedby': 'probe-hint',
          'aria-labelledby': 'probe-label',
        },
      });

      await settle();

      const reflecting = deepElements(host.shadowRoot!).filter((el) =>
        (el as Reflecting).ariaLabelledByElements?.includes(label),
      ) as Reflecting[];

      if (HOST_ARIA_OBJECT.includes(tag) || NO_ARIA_OBJECT.includes(tag)) {
        expect(reflecting).toEqual([]);

        return;
      }

      expect(reflecting).toHaveLength(1);
      expect(reflecting[0]!.matches(ROLE_BEARING)).toBe(true);
      expect(reflecting[0]!.ariaDescribedByElements).toContain(hint);
    } finally {
      label.remove();
      hint.remove();
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
