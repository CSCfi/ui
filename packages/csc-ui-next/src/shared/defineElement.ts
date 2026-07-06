import { type Component, defineCustomElement } from 'vue';

import tailwindStyles from '../tailwind.css?inline';

/**
 * Whether the platform supports constructable stylesheets
 * (`new CSSStyleSheet()` + `replaceSync` + `adoptedStyleSheets`).
 *
 * Vue 3.5's `defineCustomElement` materializes the `styles` array as a brand
 * new `<style>` element in *every* instance's shadow root — no
 * `adoptedStyleSheets`, no sharing across instances or component types. Since
 * the same ~280 KB Tailwind sheet is passed to all components, that means each
 * component instance on a page carries its own copy of the whole library sheet
 * (DOM text + a redundant CSSOM parse). When the platform supports it we adopt
 * a single shared sheet per shadow root instead, collapsing N copies to one.
 *
 * The `typeof` guards also make this SSR-safe: the docs site imports this
 * package under Nuxt SSR, where these globals are absent — we fall back then.
 */
const supportsAdopted =
  typeof CSSStyleSheet !== 'undefined' &&
  'replaceSync' in CSSStyleSheet.prototype &&
  typeof Document !== 'undefined' &&
  'adoptedStyleSheets' in Document.prototype;

/**
 * Tailwind v4 registers its internal `--tw-*` custom properties (e.g.
 * `--tw-border-style: solid`, transform/ring/gradient defaults) via `@property`
 * rules. Utilities then read those defaults — `.border-2` emits
 * `border-style: var(--tw-border-style); border-width: 2px`, relying on the
 * registered `solid` initial value.
 *
 * Crucially, `@property` only *registers* from a parsed document stylesheet —
 * NOT from a constructable sheet adopted into a shadow root. Because we apply
 * Tailwind exclusively via `adoptedStyleSheets`, those registrations never take
 * effect, so `var(--tw-border-style)` resolves to the guaranteed-invalid value
 * and `border-style` falls back to `none` (collapsing every utility border to
 * 0 width). The same would bite any utility that leans on an `@property`
 * default rather than setting the var inline.
 *
 * Registered custom properties are document-global and reach into shadow trees,
 * so we register them once from a real `<style>` in the light-DOM `<head>`.
 * Only the `@property` rules are injected — preflight and the utilities stay
 * shadow-scoped, so nothing leaks onto the consumer's page.
 */
let propsRegistered = false;

const ensureTwPropsRegistered = (): void => {
  if (propsRegistered) return;
  propsRegistered = true;

  if (typeof document === 'undefined' || !document.head) return;

  const atProperties = tailwindStyles.match(
    /@property\s+--[\w-]+\s*\{[^}]*\}/g,
  );

  if (!atProperties?.length) return;

  const style = document.createElement('style');
  style.setAttribute('data-csc-ui-tw-properties', '');
  style.textContent = atProperties.join('\n');
  document.head.appendChild(style);
};

/** The shared Tailwind sheet — built once, adopted by every shadow root. */
let sharedTailwindSheet: CSSStyleSheet | null = null;

const getSharedTailwindSheet = (): CSSStyleSheet => {
  // Register the `@property` defaults globally before any shadow root adopts the
  // sheet, so utilities reading those defaults resolve correctly.
  ensureTwPropsRegistered();

  if (!sharedTailwindSheet) {
    sharedTailwindSheet = new CSSStyleSheet();
    sharedTailwindSheet.replaceSync(tailwindStyles);
  }

  return sharedTailwindSheet;
};

/** Per-component-type SFC styles — built once per tag, shared across instances. */
const sfcSheets = new Map<string, CSSStyleSheet>();

const getSfcSheet = (
  tag: string,
  sfcStyles: string[],
): CSSStyleSheet | null => {
  if (!sfcStyles.length) return null;

  let sheet = sfcSheets.get(tag);

  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(sfcStyles.join('\n'));
    sfcSheets.set(tag, sheet);
  }

  return sheet;
};

interface ConnectableElement extends HTMLElement {
  connectedCallback?(): void;
}

const hyphenate = (key: string) =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Prop keys declared as exactly the given constructor — not a union like
 * `boolean | string` / `number | string`, where a string value could be
 * meaningful and must not be coerced.
 */
const propKeysOfType = (
  component: Component,
  ctor: BooleanConstructor | NumberConstructor,
): string[] => {
  const props = (component as { props?: Record<string, unknown> }).props ?? {};

  return Object.keys(props).filter((key) => {
    const decl = props[key];

    const type =
      decl && typeof decl === 'object' && 'type' in decl
        ? (decl as { type: unknown }).type
        : decl;

    return (
      type === ctor ||
      (Array.isArray(type) && type.length === 1 && type[0] === ctor)
    );
  });
};

const booleanPropKeys = (component: Component): string[] =>
  propKeysOfType(component, Boolean);

/**
 * Prop keys declared as exactly `Number` — not a union like
 * `number | string`, where a string value is meaningful.
 */
const numberPropKeys = (component: Component): string[] =>
  propKeysOfType(component, Number);

/**
 * Normalize server-serialized boolean attributes before Vue reads them.
 *
 * Vue SSR renders a bound boolean prop on a custom element as a literal
 * attribute — `:value.prop="false"` becomes `value="false"` in the HTML. On
 * upgrade, Vue's custom-element wrapper only casts the empty string to `true`;
 * `"true"`/`"false"` stay raw strings, so a Boolean prop receives the TRUTHY
 * string "false" (this genuinely opened `<c-modal value="false">` on page
 * load). Stencil coerced these strings, so SSR consumers rely on it.
 *
 * Must run BEFORE Vue's def resolution (before `super.connectedCallback()`):
 * the component mounts inside it, and lifecycle hooks would otherwise observe
 * the raw string. An own instance property set here is picked up by Vue's
 * pre-upgrade-props pass and wins over the attribute (which also makes this
 * correct for Boolean props whose default is `true`); a property the consumer
 * already set pre-connect is respected. Connect-time only by design — runtime
 * `setAttribute(name, 'true')` after connect still feeds the raw string; set
 * properties (or `''`) instead.
 */
const normalizeBooleanAttributes = (
  el: ConnectableElement,
  keys: string[],
): void => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(el, key)) continue;

    for (const attr of new Set([hyphenate(key), key.toLowerCase()])) {
      const raw = el.getAttribute(attr);

      if (raw === 'true' || raw === 'false') {
        (el as unknown as Record<string, boolean>)[key] = raw === 'true';
        break;
      }
    }
  }
};

/**
 * Normalize string values sitting in pre-upgrade NUMBER properties before Vue
 * reads them.
 *
 * A Vue consumer writing a plain attribute for a declared numeric prop
 * (`<c-data-table page-size="4">`) does NOT go through the attribute path:
 * Vue's `patchProp` detects a declared prop on a Vue custom element and
 * assigns it as a DOM property with the raw template string — before the
 * element is connected, i.e. as a plain own property (`el.pageSize = '4'`).
 * Vue's own number casting exists only on the attribute path, and its
 * `_resolveProps` copies the own property verbatim AFTER the resolve-time
 * cast pass, so the component receives the string `'4'`. Downstream numeric
 * arithmetic then silently degrades (`4 + '4' === '44'` — this genuinely made
 * c-data-table's middle pages render every remaining row).
 *
 * Like the boolean normalizer above, this must run BEFORE
 * `super.connectedCallback()`: the re-assigned own property is what Vue's
 * pre-upgrade-props pass reads. Only props declared exactly `Number` are
 * touched, and only when the value is a clean numeric string.
 */
const normalizeNumberProperties = (
  el: ConnectableElement,
  keys: string[],
): void => {
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(el, key)) continue;

    const raw = (el as unknown as Record<string, unknown>)[key];

    if (typeof raw !== 'string' || raw.trim() === '') continue;

    const parsed = Number(raw);

    if (!Number.isNaN(parsed)) {
      (el as unknown as Record<string, number>)[key] = parsed;
    }
  }
};

/**
 * Register a Vue SFC as a custom element under `tag`, with the shared Tailwind
 * utility stylesheet applied to its shadow root alongside the SFC's own styles.
 *
 * When constructable stylesheets are supported, styling is applied via
 * `shadowRoot.adoptedStyleSheets`: one Tailwind sheet shared library-wide and
 * one SFC sheet shared per component type, so N instances cost one sheet each
 * rather than N inlined copies. The adopted order `[tailwind, sfc]` mirrors the
 * previous `[tailwindStyles, ...sfcStyles]` injection order (SFC styles win
 * cascade ties), so rendering is unchanged — including for the components still
 * styled by an SFC `<style>` block.
 *
 * On platforms without support it falls back to Vue's per-instance `<style>`
 * injection (the previous behavior).
 *
 * No-op if `tag` is already defined — the docs may have registered the Stencil
 * version first, or this function may be called twice.
 */
export function defineElement(tag: string, component: Component): void {
  if (customElements.get(tag)) return;

  const sfcStyles = (component as { styles?: string[] }).styles || [];

  // Vue's `defineCustomElement` overloads don't accept the broad `Component`
  // union directly (it includes constructor forms that fail the options
  // overload); cast to the form it expects. Runtime behaviour is unchanged.
  const vueComponent = component as Parameters<typeof defineCustomElement>[0];

  const booleanKeys = booleanPropKeys(component);

  const numberKeys = numberPropKeys(component);

  if (!supportsAdopted) {
    // Fallback: let Vue inject the styles per instance, as before. The merge is
    // deliberate — Vue's `styles` option replaces (not appends to) the SFC's
    // `.styles` array, so we concatenate Tailwind with the SFC styles ourselves.
    const Base = defineCustomElement(vueComponent, {
      styles: [tailwindStyles, ...sfcStyles],
    });

    class Element extends (Base as unknown as { new (): ConnectableElement }) {
      connectedCallback() {
        normalizeBooleanAttributes(this, booleanKeys);
        normalizeNumberProperties(this, numberKeys);
        super.connectedCallback?.();
      }
    }

    customElements.define(tag, Element as unknown as CustomElementConstructor);

    return;
  }

  // Pass empty `styles` so Vue injects nothing (`_applyStyles` no-ops on an
  // empty array); we adopt shared sheets in connectedCallback instead.
  const Base = defineCustomElement(vueComponent, { styles: [] });

  const typeSheet = getSfcSheet(tag, sfcStyles);

  class Element extends (Base as unknown as { new (): ConnectableElement }) {
    connectedCallback() {
      // Coerce SSR'd "true"/"false" boolean attributes and string values in
      // pre-upgrade Number properties before Vue resolves props (the
      // component mounts inside super.connectedCallback).
      normalizeBooleanAttributes(this, booleanKeys);
      normalizeNumberProperties(this, numberKeys);

      // Adopt the sheets BEFORE Vue mounts the shadow content: Vue flushes
      // `mounted` hooks synchronously inside super.connectedCallback(), and a
      // hook that reads layout (e.g. c-input's label measurement) forces a
      // reflow. When that reflow ran before the sheets existed, the UNSTYLED
      // computed values became the start state for every `transition-*`
      // utility — the field visibly animated its padding/size in from nothing
      // on first paint. Vue creates the shadow root in its constructor, so it
      // already exists here; the post-super call is a safety net for the case
      // where the root only appears during super.connectedCallback().
      this.adoptSheets();
      super.connectedCallback?.();
      this.adoptSheets();
    }

    private adoptSheets() {
      const root = this.shadowRoot;

      if (!root) return;

      const shared = getSharedTailwindSheet();

      // Idempotent across reconnects and the pre/post-super double call.
      if (root.adoptedStyleSheets.includes(shared)) return;
      root.adoptedStyleSheets = [
        shared,
        ...(typeSheet ? [typeSheet] : []),
        ...root.adoptedStyleSheets,
      ];
    }
  }

  customElements.define(tag, Element as unknown as CustomElementConstructor);
}
