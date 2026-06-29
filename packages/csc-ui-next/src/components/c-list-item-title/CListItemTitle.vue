<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * single `root` slot is the component's part and the `active` variant replaces
 * the original `:host([active])` rule. Consumer customization is via `::part()`
 * against the `root` part name (ADR-0006); there is no `override` prop. The old
 * per-component `--c-*` indirection vars are dropped in favour of the global
 * design tokens (`--c-text-body`, `primary-600`).
 */
const listItemTitle = tv({
  defaultVariants: {
    active: false,
  },
  slots: {
    root: 'block font-medium text-[var(--c-text-body)]',
  },
  variants: {
    active: { true: { root: 'text-primary-600' } },
  },
});

interface CListItemTitleProps {
  active?: boolean;
}

const props = withDefaults(defineProps<CListItemTitleProps>(), {
  active: false,
});

const ui = computed(() => listItemTitle({ active: props.active }));
</script>
