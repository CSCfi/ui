/**
 * Emulate a browser without CSS anchor positioning (Firefox 140 ESR) inside
 * the suite's Chromium, which positions natively and no longer ships a
 * runtime flag to turn the feature off (ADR-0056).
 *
 * Such a browser's CSSOM drops every declaration of a property it does not
 * know: `setProperty`, a `cssText` write and the named accessors all leave
 * the `style` attribute without it. This helper does the same for the anchor
 * properties and reports them unsupported through `CSS.supports`, so a
 * component takes its non-native path and Chromium's native engine sees no
 * inline anchor declaration to act on. Stylesheet rules (`@position-try`,
 * `position-try-fallbacks`) still parse, but without a `position-anchor` they
 * are inert.
 *
 * Install before mounting; the returned function restores the prototypes.
 */

const ANCHOR_PROPERTY =
  /^(anchor-name|anchor-scope|position-anchor|position-area|position-try|position-try-fallbacks|position-try-order|position-visibility)$/;

const ANCHOR_MENTION =
  /\b(anchor-name|anchor-scope|position-anchor|position-area|position-try|position-visibility)\b/;

const camel = (name: string): string =>
  name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

/** Split a declaration list on top-level `;` (never inside parentheses). */
const declarations = (text: string): string[] => {
  const out: string[] = [];

  let depth = 0;

  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }

  out.push(text.slice(start));

  return out;
};

const dropAnchorDeclarations = (text: string): string =>
  declarations(text)
    .filter((d) => !ANCHOR_PROPERTY.test(d.split(':')[0]?.trim() ?? ''))
    .join(';');

export function withoutAnchorPositioning(): () => void {
  const proto = CSSStyleDeclaration.prototype;

  const restore: Array<() => void> = [];

  const patch = (key: PropertyKey, descriptor: PropertyDescriptor): void => {
    const original = Object.getOwnPropertyDescriptor(proto, key);

    Object.defineProperty(proto, key, { ...descriptor, configurable: true });
    restore.push(() => {
      if (original) Object.defineProperty(proto, key, original);
      else delete (proto as unknown as Record<PropertyKey, unknown>)[key];
    });
  };

  const setProperty = proto.setProperty;

  patch('setProperty', {
    value(this: CSSStyleDeclaration, name: string, ...rest: [string, string?]) {
      if (ANCHOR_PROPERTY.test(name)) return;
      setProperty.call(this, name, ...rest);
    },
    writable: true,
  });

  const cssText = Object.getOwnPropertyDescriptor(proto, 'cssText')!;

  patch('cssText', {
    get: cssText.get,
    set(this: CSSStyleDeclaration, text: string) {
      cssText.set!.call(this, dropAnchorDeclarations(text));
    },
  });

  for (const source of ANCHOR_PROPERTY.source
    .replace(/^\^\(|\)\$$/g, '')
    .split('|')) {
    for (const key of [source, camel(source)]) {
      patch(key, { get: () => '', set: () => {} });
    }
  }

  const supports = CSS.supports.bind(CSS);

  const fakeSupports = (...args: [string, string] | [string]): boolean =>
    ANCHOR_MENTION.test(args[0]) ? false : supports(...(args as [string]));

  CSS.supports = fakeSupports as typeof CSS.supports;
  restore.push(() => {
    CSS.supports = supports;
  });

  return () => {
    for (const undo of restore.reverse()) undo();
  };
}
