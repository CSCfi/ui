import { defineCustomElement, type Component } from 'vue';
import tailwindStyles from '../tailwind.css?inline';

/**
 * Register a Vue SFC as a custom element under `tag`, with the shared
 * Tailwind utility stylesheet inlined into its shadow root alongside
 * the SFC's own `<style>` blocks.
 *
 * The merge in `styles` is deliberate: Vue's second-arg `styles` option
 * replaces (not appends to) the SFC's `.styles` array, so we concatenate
 * Tailwind with the SFC styles ourselves.
 *
 * No-op if `tag` is already defined — the docs may have registered the
 * Stencil version first, or this function may be called twice.
 */
export function defineElement(tag: string, component: Component): void {
  if (customElements.get(tag)) return;
  const sfcStyles = ((component as { styles?: string[] }).styles) || [];
  const Element = defineCustomElement(component, {
    styles: [tailwindStyles, ...sfcStyles],
  });
  customElements.define(tag, Element);
}
