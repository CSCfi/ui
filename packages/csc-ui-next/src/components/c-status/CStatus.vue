<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script lang="ts">
export interface CStatusProps {
  /**
   * Status type
   *
   * @seeded from csc-ui — verify
   */
  type?: CStatusType;
}

/**
 * Status type of the pill. Each value paints the matching semantic status
 * colours; omitting the attribute renders the neutral primary pill.
 */
export type CStatusType = 'error' | 'info' | 'success' | 'warning';
</script>

<script setup lang="ts">
/**
 * @slot default - Status text
 *
 * @csspart root - The status pill wrapping the slotted text
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004): the
 * `root` slot is the status pill and the `type` variant replaces the
 * `.c-status--<type>` colour cascade. Consumer customization is via
 * `::part(root)` (ADR-0006); there is no `override` prop. The per-component
 * `--c-status-*` indirection vars are dropped in favour of the semantic status
 * roles (ADR-0010): the pill is the role's `subtle` fill with its `on-*-subtle`
 * text (e.g. info -> bg-info-subtle / text-on-info-subtle).
 *
 * `box-shadow: inset 0 0 0 1px currentColor` -> `ring-1 ring-inset ring-current`
 * so the 1px inner outline tracks the variant's text colour, matching the source.
 */
// Hoisted so the runtime guard below can test membership; the `satisfies`
// keeps the map complete against the public union (ADR-0015).
const typeVariants = {
  error: { root: 'bg-error-subtle text-on-error-subtle' },
  info: { root: 'bg-info-subtle text-on-info-subtle' },
  success: { root: 'bg-success-subtle text-on-success-subtle' },
  warning: { root: 'bg-warning-subtle text-on-warning-subtle' },
} satisfies Record<CStatusType, object>;

const status = tv({
  defaultVariants: {
    type: '',
  },
  slots: {
    root: 'inline-flex items-center justify-center overflow-hidden relative min-h-6 min-w-[88px] px-4 py-1 rounded-csc-md text-sm leading-none ring-1 ring-inset ring-current bg-primary-subtle text-on-primary-subtle',
  },
  variants: {
    type: {
      '': '',
      ...typeVariants,
    },
  },
});

const props = defineProps<CStatusProps>();

// Attributes can deliver any string at runtime; unknown values fall back to
// the neutral pill (ADR-0015).
const ui = computed(() =>
  status({
    type: props.type && props.type in typeVariants ? props.type : '',
  }),
);
</script>
