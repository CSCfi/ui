<template>
  <div :class="ui.root()" part="root">
    <div :class="ui.label()" part="label">
      <slot />
    </div>

    <!-- Forward the divider's parts outward under the `<child>-<part>` naming
         convention so consumers can reach them via
         `c-side-navigation-title::part(divider-root)`; `::part` doesn't pierce
         nested shadow roots, and the bare `root` name is already taken by this
         component's own root part. -->
    <c-divider :class="ui.divider()" exportparts="root:divider-root" />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The title text of the navigation section
 *
 * @csspart root - The outer wrapper around the label and the divider
 * @csspart label - The uppercase section title label
 * @csspart divider-root - The underline divider's root element, forwarded from the inner c-divider
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config. The
 * old per-component `--c-side-navigation-title-*` indirection vars are dropped;
 * the title is authored against the `on-nav` semantic role — the
 * foreground colour for content on the themed nav surface. Consumer
 * customization is via `::part(root)`.
 *
 * The host stays `display:contents` (global) and the visual box lives on the
 * inner `root` element. The underline is a `c-divider`, but the `divider`
 * token is a translucent *black* ink in light mode (ADR-0036), audited for the
 * surface ladder — invisible on the nav surface, which is brand-dark in both
 * modes. The `divider` slot therefore scopes `--c-divider` to a translucent
 * `on-nav` ink for that one element: the same principle (a translucent ink of
 * the surface's foreground) applied to the nav chrome. 40% reads clearly on
 * the nav without becoming the solid rule the Stencil-era title drew.
 *
 * The top margin separates a section from the items above it; the first title
 * in a navigation has nothing above it but the nav padding, so the escape-hatch
 * rule below drops the margin when the host is its parent's first child.
 */
const sideNavigationTitle = tv({
  slots: {
    divider: '[--c-divider:color-mix(in_srgb,var(--c-on-nav)_40%,transparent)]',
    label:
      'flex items-center gap-2 px-2 text-on-nav uppercase text-xs tracking-widest',
    root: 'grid gap-2 mt-6 mb-2',
  },
});

const ui = computed(() => sideNavigationTitle());
</script>

<!--
  Escape-hatch CSS (ADR-0007): a positional host selector, which no utility can
  express. The first section title sits directly under the nav padding, so its
  section-separating top margin is dropped.
-->
<style>
:host(:first-child) [part='root'] {
  margin-top: 0;
}
</style>
