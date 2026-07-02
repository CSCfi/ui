<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - The title text of the list item
 *
 * @csspart root - The element wrapping the title text
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * single `root` slot is the component's part and the `active` variant replaces
 * the original `:host([active])` rule. Consumer customization is via `::part()`
 * against the `root` part name (ADR-0006); there is no `override` prop. The old
 * per-component `--c-*` indirection vars are dropped in favour of the semantic
 * design tokens (`on-surface` body text, `primary` active accent, ADR-0010).
 */
const listItemTitle = tv({
  defaultVariants: {
    active: false,
  },
  slots: {
    root: 'block font-medium text-on-surface',
  },
  variants: {
    active: { true: { root: 'text-primary' } },
  },
});

interface CListItemTitleProps {
  /**
   * Set the title active
   *
   * @seeded from csc-ui — verify
   */
  active?: boolean;
}

const props = withDefaults(defineProps<CListItemTitleProps>(), {
  active: false,
});

const ui = computed(() => listItemTitle({ active: props.active }));
</script>
