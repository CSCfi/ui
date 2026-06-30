<template>
  <a :class="ui.root()" :href="href || undefined" part="root" tabindex="0">
    <img :alt :class="ui.image()" :src="src || ''" part="image" />

    <div :class="ui.title()" part="title">
      <slot />
    </div>
  </a>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The old
 * `--c-login-button-*` indirection vars are dropped and the card is authored
 * directly against design tokens (`bg-white`, `tertiary-*`, `primary-600`,
 * `--c-text-system`). The host stays `display:contents` (global); the anchor is
 * the `root` box. Consumer customization is via the stamped parts (ADR-0006).
 *
 * Hover and focus-visible states are authored as `hover:`/`focus-visible:`
 * utilities on `root`. The single-side title underline uses an arbitrary
 * box-shadow (no single-side ring utility matches the original).
 */
const loginButton = tv({
  slots: {
    image: 'place-self-center max-h-30 max-w-50 px-6 py-2',
    root: 'grid grid-rows-[1fr_auto] grid-cols-1 h-full min-h-42 rounded-csc-md border border-solid overflow-hidden border-tertiary-200 bg-white text-[var(--c-text-system)] text-center no-underline cursor-pointer outline outline-1 outline-transparent hover:border-primary-600 hover:outline-primary-600 focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2',
    title:
      'bg-tertiary-100 p-1 text-sm shadow-[0_-1px_0_0_var(--c-tertiary-200)]',
  },
});

const ui = computed(() => loginButton());

interface CLoginButtonProps {
  alt?: string;
  href?: string;
  src?: string;
}

withDefaults(defineProps<CLoginButtonProps>(), {
  alt: '',
  href: '',
  src: '',
});
</script>
