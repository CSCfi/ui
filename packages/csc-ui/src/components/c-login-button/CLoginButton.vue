<template>
  <!-- A link with an `href`, else a native button the keyboard presses. -->
  <component
    :is="href ? 'a' : 'button'"
    :class="ui.root()"
    :href="href || undefined"
    :type="href ? undefined : 'button'"
    part="root"
  >
    <!-- Spans: a button takes phrasing content only. -->
    <span :class="ui.imageWrap()" part="image-wrap">
      <slot name="image">
        <img :alt :class="ui.image()" :src="src || ''" part="image" />
      </slot>
    </span>

    <span :class="ui.title()" part="label">
      <slot />
    </span>
  </component>
</template>

<script setup lang="ts">
/**
 * @slot default - The provider's name, shown in the bar under the logo
 * @slot image - Custom provider logo markup (an inline `<svg>`, a `<picture>`, …) replacing the default `<img>` rendered from `src`
 *
 * @csspart root - The whole clickable card: a link with `href`, else a button
 * @csspart image-wrap - The area above the name bar that centres the logo (default image or slotted content)
 * @csspart image - The default provider logo `<img>` (absent when the `image` slot is used)
 * @csspart label - The bar under the logo holding the provider's name
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
    imageWrap: 'flex min-h-0 items-center justify-center',
    root: 'grid h-full min-h-42 w-full cursor-pointer grid-cols-1 grid-rows-[1fr_auto] overflow-hidden rounded-csc-md border border-solid border-border bg-surface text-center text-on-surface-muted no-underline outline outline-1 outline-transparent hover:border-primary hover:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
    title:
      'block bg-surface-muted p-1 text-sm shadow-[0_-1px_0_0_var(--c-border)]',
  },
});

const ui = computed(() => loginButton());

interface CLoginButtonProps {
  /**
   * Alternative text for the `src` logo, read before the provider's name.
   * Leave it empty when the name already identifies the provider.
   *
   * @freeform any image alt text
   */
  alt?: string;

  /**
   * The provider's sign-in URL, which makes the card a link. Without it the
   * card is a button: handle its `click`.
   *
   * @freeform any URL
   */
  href?: string;

  /**
   * URL of the provider's logo, shown above the name. The `image` slot
   * replaces it.
   *
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
