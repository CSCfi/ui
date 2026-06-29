<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The
 * old per-component `--c-side-navigation-title-*` indirection vars are dropped;
 * the title is authored directly against the `white` design token. Consumer
 * customization is via `::part(root)` (ADR-0006).
 *
 * The host stays `display:contents` (global) and the visual box lives on the
 * inner `root` element. The 1px underline uses an arbitrary box-shadow because
 * there is no single-side ring/border utility that matches the original.
 */
const sideNavigationTitle = tv({
  slots: {
    root: 'flex items-center gap-2 mt-5 mb-4 py-1 text-white shadow-[0_1px_0_0_var(--c-white)]',
  },
});

const ui = computed(() => sideNavigationTitle());
</script>
