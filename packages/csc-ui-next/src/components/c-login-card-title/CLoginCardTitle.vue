<template>
  <header :class="ui.root()" part="root">
    <slot />
  </header>
</template>

<script setup lang="ts">
/**
 * @slot default - Login card title text
 *
 * @csspart root - The inner header element carrying the heading typography
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config; the
 * inner `<header>` (`root` part) is the public customization surface.
 * The typography the original carried on `:host` now lives on the
 * `root` element: 40px/700 balanced heading in the primary colour. The old
 * `--c-login-card-title-color` override indirection is dropped — the colour
 * comes straight from the `primary` semantic role. The font-size keys off the
 * `--_c-login-card-title-font-size` contract var (40px default) so the parent
 * c-login-card can shrink it to 32px in mobile layout — it sets that var via
 * `::slotted(c-login-card-title)` and it inherits across the shadow boundary
 * into this `root` element.
 */
const cardTitle = tv({
  slots: {
    root: 'block m-0 text-[length:var(--_c-login-card-title-font-size,40px)]/[1.375] font-bold text-balance text-primary [font-family:var(--c-font-family)]',
  },
});

const ui = computed(() => cardTitle());
</script>
