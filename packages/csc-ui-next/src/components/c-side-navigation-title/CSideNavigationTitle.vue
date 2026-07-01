<template>
  <div :class="ui.root()" part="root">
    <div :class="ui.label()" part="label">
      <slot />
    </div>

    <!-- Forward the divider's parts outward under the `<child>-<part>` naming
         convention (ADR-0006) so consumers can reach them via
         `c-side-navigation-title::part(divider-root)`; `::part` doesn't pierce
         nested shadow roots, and the bare `root` name is already taken by this
         component's own root part. -->
    <c-divider exportparts="root:divider-root" />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The
 * old per-component `--c-side-navigation-title-*` indirection vars are dropped;
 * the title is authored against the `on-nav` semantic role (ADR-0010) — the
 * foreground colour for content on the themed nav surface. Consumer
 * customization is via `::part(root)` (ADR-0006).
 *
 * The host stays `display:contents` (global) and the visual box lives on the
 * inner `root` element. The 1px underline uses an arbitrary box-shadow because
 * there is no single-side ring/border utility that matches the original.
 */
const sideNavigationTitle = tv({
  slots: {
    label:
      'flex items-center gap-2 px-2 text-on-nav uppercase text-xs tracking-widest',
    root: 'grid gap-2 mt-6 mb-2',
  },
});

const ui = computed(() => sideNavigationTitle());
</script>
