<template>
  <div :aria-level="headingLevel" :class="ui.root()" part="root" role="heading">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Login card title text
 *
 * @csspart root - The heading (`role="heading"`, at `heading-level`) carrying the heading typography
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config; the
 * inner heading (`root` part) is the public customization surface.
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
    root: 'm-0 block text-[length:var(--_c-login-card-title-font-size,40px)]/[1.375] font-bold text-balance text-primary',
  },
});

interface CLoginCardTitleProps {
  /**
   * The title's heading level, 1 to 6: pick the one that fits the card's
   * place in the page's outline (2 under the page's `h1`, 3 inside a section
   * with an `h2`).
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

withDefaults(defineProps<CLoginCardTitleProps>(), {
  headingLevel: 2,
});

const ui = computed(() => cardTitle());
</script>
