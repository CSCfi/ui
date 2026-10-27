<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Login card content
 *
 * @csspart root - The inner wrapper stacking the slotted content vertically
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config; the
 * inner `<div>` (`root` part) is the public customization surface; the card itself is the `<article>`.
 * It stacks its slotted content vertically with a fixed 24px gap.
 * The old `:host{display:block}` box is dropped — the host stays
 * `display:contents` and the `root` element carries the layout instead.
 */
const cardContent = tv({
  slots: {
    root: 'flex flex-col gap-6',
  },
});

const ui = computed(() => cardContent());
</script>
