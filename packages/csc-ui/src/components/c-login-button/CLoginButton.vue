<template>
  <a :class="ui.root()" :href="href || undefined" part="root" tabindex="0">
    <div :class="ui.imageWrap()" part="image-wrap">
      <slot name="image">
        <img :alt :class="ui.image()" :src="src || ''" part="image" />
      </slot>
    </div>

    <div :class="ui.title()" part="title">
      <slot />
    </div>
  </a>
</template>

<script setup lang="ts">
/**
 * @slot default - The title shown in the bottom bar
 * @slot image - Custom provider logo markup (an inline `<svg>`, a `<picture>`, …) replacing the default `<img>` rendered from `src`
 *
 * @csspart root - The anchor element forming the whole clickable card
 * @csspart image-wrap - The area above the title bar that centers the logo (default image or slotted content)
 * @csspart image - The default provider logo `<img>` (absent when the `image` slot is used)
 * @csspart title - The bottom title bar wrapping the slotted label
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config. The old
 * `--c-login-button-*` indirection vars are dropped and the card is authored
 * directly against the semantic design tokens (`bg-surface`, `border`,
 * `primary`, `on-surface-muted`). The host stays `display:contents` (global); the anchor is
 * the `root` box. Consumer customization is via the stamped parts.
 *
 * Hover and focus-visible states are authored as `hover:`/`focus-visible:`
 * utilities on `root`. The single-side title underline uses an arbitrary
 * box-shadow (no single-side ring utility matches the original).
 */
const loginButton = tv({
  slots: {
    image: 'max-h-30 max-w-50 px-6 py-2',
    imageWrap: 'flex items-center justify-center min-h-0',
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
   * @freeform any image alt text
   */
  alt?: string;
  /**
   * Login provider link. Do not set if using a javascript click handler
   *
   * @seeded from csc-ui — verify
   * @freeform any URL
   */
  href?: string;
  /**
   * Login provider logo url
   *
   * @seeded from csc-ui — verify
   * @freeform any image URL
   */
  src?: string;
}

withDefaults(defineProps<CLoginButtonProps>(), {
  alt: '',
  href: '',
  src: '',
});
</script>
