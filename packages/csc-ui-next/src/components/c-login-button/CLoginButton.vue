<template>
  <a :class="ui.root()" :href="href || undefined" part="root" tabindex="0">
    <img :alt :class="ui.image()" :src="src || ''" part="image" />

    <div :class="ui.title()" part="title">
      <slot />
    </div>
  </a>
</template>

<script setup lang="ts">
/**
 * @slot default - Default slot
 *
 * @csspart root - The anchor element forming the whole clickable card
 * @csspart image - The provider logo image centered in the card
 * @csspart title - The bottom title bar wrapping the slotted label
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The old
 * `--c-login-button-*` indirection vars are dropped and the card is authored
 * directly against the semantic design tokens (`bg-surface`, `border`,
 * `primary`, `on-surface-muted`). The host stays `display:contents` (global); the anchor is
 * the `root` box. Consumer customization is via the stamped parts (ADR-0006).
 *
 * Hover and focus-visible states are authored as `hover:`/`focus-visible:`
 * utilities on `root`. The single-side title underline uses an arbitrary
 * box-shadow (no single-side ring utility matches the original).
 */
const loginButton = tv({
  slots: {
    image: 'place-self-center max-h-30 max-w-50 px-6 py-2',
    root: 'grid grid-rows-[1fr_auto] grid-cols-1 h-full min-h-42 rounded-csc-md border border-solid overflow-hidden border-border bg-surface text-on-surface-muted text-center no-underline cursor-pointer outline outline-1 outline-transparent hover:border-primary hover:outline-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2',
    title: 'bg-surface-muted p-1 text-sm shadow-[0_-1px_0_0_var(--c-border)]',
  },
});

const ui = computed(() => loginButton());

interface CLoginButtonProps {
  /**
   * Alt description for logo
   *
   * @seeded from csc-ui — verify
   */
  alt?: string;
  /**
   * Login provider link. Do not set if using a javascript click handler
   *
   * @seeded from csc-ui — verify
   */
  href?: string;
  /**
   * Login provider logo url
   *
   * @seeded from csc-ui — verify
   */
  src?: string;
}

withDefaults(defineProps<CLoginButtonProps>(), {
  alt: '',
  href: '',
  src: '',
});
</script>
