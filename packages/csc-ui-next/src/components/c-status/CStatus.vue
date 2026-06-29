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
 * `root` slot is the status pill and the `type` variant replaces the
 * `.c-status--<type>` colour cascade. Consumer customization is via
 * `::part(root)` (ADR-0006); there is no `override` prop. The per-component
 * `--c-status-*` indirection vars are dropped in favour of global design tokens
 * (e.g. var(--c-info-200) -> bg-info-200, var(--c-info-800) -> text-info-800).
 *
 * `box-shadow: inset 0 0 0 1px currentColor` -> `ring-1 ring-inset ring-current`
 * so the 1px inner outline tracks the variant's text colour, matching the source.
 */
const status = tv({
  defaultVariants: {
    type: '',
  },
  slots: {
    root: 'inline-flex items-center justify-center overflow-hidden relative min-h-6 min-w-[88px] px-4 py-1 rounded-csc-md text-sm leading-none ring-1 ring-inset ring-current bg-primary-200 text-primary-800',
  },
  variants: {
    type: {
      '': '',
      error: { root: 'bg-error-200 text-error-800' },
      info: { root: 'bg-info-200 text-info-800' },
      success: { root: 'bg-success-200 text-success-800' },
      warning: { root: 'bg-warning-200 text-warning-800' },
    },
  },
});

interface CStatusProps {
  type?: string;
}

const props = withDefaults(defineProps<CStatusProps>(), {
  type: '',
});

const ui = computed(() =>
  status({
    type: props.type as '' | 'error' | 'info' | 'success' | 'warning',
  }),
);
</script>
