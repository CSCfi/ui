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
    root: 'flex items-center gap-2 mt-5 mb-2 pb-3 pt-1 px-2 text-on-nav border-b border-border uppercase text-xs',
  },
});

const ui = computed(() => sideNavigationTitle());
</script>
