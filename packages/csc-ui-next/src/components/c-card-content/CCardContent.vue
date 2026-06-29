<template>
  <article :class="ui.root()" part="root">
    <slot />
  </article>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004) and the
 * `root` is the public part (ADR-0006). Horizontal padding and the vertical
 * gap both key off `--_c-card-gap` (the shared spacing contract the parent
 * c-card sets on its inner element; it inherits across the shadow boundary
 * into this slotted child). It falls back to 24px when used outside a c-card.
 * `::slotted(*)` clamping consumer content stays in the escape-hatch <style>
 * (ADR-0007) — utilities cannot target slotted light-DOM children.
 */
const cardContent = tv({
  slots: {
    root: 'flex flex-col gap-[var(--_c-card-gap,24px)] px-[var(--_c-card-gap,24px)]',
  },
});

const ui = computed(() => cardContent());
</script>

<!--
  Escape-hatch CSS (ADR-0007): `::slotted(...)` styles consumer-provided
  light-DOM children, which Tailwind utilities cannot target.
-->
<style>
::slotted(*) {
  max-width: 100%;
}
</style>
