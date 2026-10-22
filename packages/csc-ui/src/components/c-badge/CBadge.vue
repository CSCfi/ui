<template>
  <span :class="badge()" part="root">
    <slot />
  </span>
</template>

<script setup lang="ts">
/**
 * @slot default - The badge content, typically a short count or label
 *
 * @csspart root - The badge pill itself, absolutely positioned at the top right corner of its parent
 */
import { tv } from 'tailwind-variants';

/**
 * Styling lives entirely in this `tailwind-variants` config. The
 * badge's box (background, border ring, size, absolute positioning) is rendered
 * on an inner `root` element rather than the host, so the global
 * `:host{display:contents}` is left untouched. Consumer customization is via
 * `::part(root)`; there is no `override` prop. The per-component
 * `--c-badge-*` indirection vars are dropped in favour of semantic tokens:
 * the warning status role for the fill + its on-colour text, and a
 * `surface`-coloured ring so the badge reads as a cut-out against whatever
 * surface it sits on (the ring tracks the theme instead of being hardcoded
 * white).
 */
const badge = tv({
  base: 'pointer-events-none absolute -top-1.5 -right-1.5 z-[2] flex h-4 min-w-4 items-center justify-center rounded-2xl bg-warning px-1 text-xs leading-none text-on-warning ring-2 ring-surface',
});

// `<slot />`-only authoring previously kept fallthrough attrs on the host; we
// now render a real `root` box, so the default fallthrough (onto root) is fine.
</script>
