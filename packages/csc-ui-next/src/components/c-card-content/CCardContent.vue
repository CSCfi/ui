<template>
  <article :class="ui.root()" part="root">
    <slot />
  </article>
</template>

<script setup lang="ts">
/**
 * @slot default - Card contents
 *
 * @csspart root - The padded wrapper stacking the slotted content vertically
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config and the
 * `root` is the public part. Horizontal padding and the vertical
 * gap both key off `--_c-card-gap` (the shared spacing contract the parent
 * c-card sets on its inner element; it inherits across the shadow boundary
 * into this slotted child). It falls back to 24px when used outside a c-card.
 * `::slotted(*)` clamping consumer content stays in the escape-hatch <style>
 * — utilities cannot target slotted light-DOM children.
 */
const cardContent = tv({
  slots: {
    root: 'flex flex-col gap-[var(--_c-card-gap,24px)] px-[var(--_c-card-gap,24px)]',
  },
});

const ui = computed(() => cardContent());
</script>

<!--
  Escape-hatch CSS: `::slotted(...)` styles consumer-provided
  light-DOM children, which Tailwind utilities cannot target.
-->
<style>
::slotted(*) {
  max-width: 100%;
}
</style>
