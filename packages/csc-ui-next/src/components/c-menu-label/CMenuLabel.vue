<template>
  <div :class="label()" part="root" role="presentation">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';

/**
 * Section label for a group of `c-menu-item`s. Presentational heading inside
 * the menu list; it is `role="presentation"` so it is not announced as an
 * interactive menuitem. Styling lives in this `tailwind-variants` config
 * (ADR-0004); customization via `::part(root)` (ADR-0006). No `<style>` block —
 * the host stays `display: contents` and the `root` box lays out inline in the
 * menu list.
 */
const label = tv({
  base: 'block px-[10px] pt-2 pb-1 text-xs font-semibold tracking-wide uppercase select-none pointer-events-none text-on-surface-faint',
});
</script>
