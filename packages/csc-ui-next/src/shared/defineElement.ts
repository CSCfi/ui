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

  if (!supportsAdopted) {
    // Fallback: let Vue inject the styles per instance, as before. The merge is
    // deliberate — Vue's `styles` option replaces (not appends to) the SFC's
    // `.styles` array, so we concatenate Tailwind with the SFC styles ourselves.
    const Element = defineCustomElement(component, {
      styles: [tailwindStyles, ...sfcStyles],
    });
    customElements.define(tag, Element);

    return;
  }

  // Pass empty `styles` so Vue injects nothing (`_applyStyles` no-ops on an
  // empty array); we adopt shared sheets in connectedCallback instead.
  const Base = defineCustomElement(component, { styles: [] });

  const typeSheet = getSfcSheet(tag, sfcStyles);

  class Element extends (Base as unknown as { new (): ConnectableElement }) {
    connectedCallback() {
      // Vue creates the shadow root in its constructor and renders content
      // here; run that first, then attach the shared sheets.
      super.connectedCallback?.();

      const root = this.shadowRoot;

      if (!root) return;

      const shared = getSharedTailwindSheet();

      // Idempotent across reconnects.
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
