<template>
  <article :class="ui.root()" part="root">
    <slot />
  </article>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004); the
 * inner `<article>` (`root` part) is the public customization surface
 * (ADR-0006). It stacks its slotted content vertically with a fixed 24px gap.
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
