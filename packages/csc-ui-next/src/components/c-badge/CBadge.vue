<template>
  <span :class="badge()" part="root">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The
 * badge's box (background, border ring, size, absolute positioning) is rendered
 * on an inner `root` element rather than the host, so the global
 * `:host{display:contents}` is left untouched. Consumer customization is via
 * `::part(root)` (ADR-0006); there is no `override` prop. The per-component
 * `--c-badge-*` indirection vars are dropped in favour of global design tokens:
 *   var(--c-warning-600) -> bg-warning-600, var(--c-white) -> text-white,
 *   box-shadow 0 0 0 2px var(--c-white) -> ring-2 ring-white.
 */
const badge = tv({
  base: 'absolute -right-1.5 -top-1.5 z-[2] flex items-center justify-center min-w-4 h-4 px-1 rounded-2xl text-xs leading-none pointer-events-none bg-warning-600 text-white ring-2 ring-white',
});

// `<slot />`-only authoring previously kept fallthrough attrs on the host; we
// now render a real `root` box, so the default fallthrough (onto root) is fine.
</script>
