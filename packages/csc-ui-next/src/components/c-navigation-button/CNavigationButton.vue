<template>
  <c-icon-button :class="ui.root()" part="root" text>
    <c-icon :path="menuIcon" />
  </c-icon-button>
</template>

<script setup lang="ts">
import { mdiMenu } from '@mdi/js';
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The
 * old `--c-navigation-button-color` indirection (and the dead
 * `--c-icon-button-text-text-color` child var) are dropped: the colour is set
 * with a text-colour utility on the `root` element, which cascades into the
 * child `c-icon-button`/`c-icon` via `currentColor`. Customization is via
 * `::part(root)` (ADR-0006). The host stays `display:contents` (global); the
 * `root` element carries the visual box.
 */
const navigationButton = tv({
  slots: {
    root: 'block mr-0 cursor-pointer select-none rounded-full text-[var(--c-text-system)]',
  },
});

const ui = computed(() => navigationButton());

const menuIcon = mdiMenu;

const host = useHost();

onMounted(() => host?.setAttribute('tabindex', '0'));
</script>
