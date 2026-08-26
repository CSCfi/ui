<template>
  <footer :class="ui.root()" part="root">
    <menu :class="ui.actions()" part="actions">
      <slot />
    </menu>
  </footer>
</template>

<script lang="ts">
/**
 * Cross-axis alignment of the slotted actions within the row.
 */
export type CCardActionsAlign = 'center' | 'end' | 'start';

/**
 * Main-axis distribution of the slotted actions. `stretch` makes every action
 * grow to fill the row.
 */
export type CCardActionsJustify =
  | 'center'
  | 'end'
  | 'space-around'
  | 'space-between'
  | 'start'
  | 'stretch';

export interface CCardActionsProps {
  /**
   * Align the actions
   *
   * @seeded from csc-ui — verify
   */
  align?: CCardActionsAlign;
  /**
   * Justify the actions
   *
   * @seeded from csc-ui — verify
   */
  justify?: CCardActionsJustify;
}
</script>

<script setup lang="ts">
/**
 * @slot default - Card actions
 *
 * @csspart root - The padded footer wrapping the actions row
 * @csspart actions - The flex row laying out the slotted action elements
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config; `root`
 * (the padded <footer>) and `actions` (the flex row) are the public parts.
 * Horizontal padding keys off `--_c-card-padding-inline` (the shared spacing
 * contract the parent c-card sets, inheriting across the shadow boundary) with
 * a 28px fallback. Vertical padding is intentionally absent — the parent card's
 * article already supplies `padding-block`. The `align`/`justify` props drive
 * the flex alignment via variants. `::slotted(...)` stretch rules stay in the
 * escape-hatch <style>: they target consumer light-DOM children.
 */
// Hoisted so the runtime guards below can test membership; the `satisfies`
// keeps the maps complete against the public unions.
const alignVariants = {
  center: { actions: 'items-center' },
  end: { actions: 'items-end' },
  start: { actions: 'items-start' },
} satisfies Record<CCardActionsAlign, object>;

const justifyVariants = {
  center: { actions: 'justify-center' },
  end: { actions: 'justify-end' },
  'space-around': { actions: 'justify-around' },
  'space-between': { actions: 'justify-between' },
  start: { actions: 'justify-start' },
  // `actions--stretch` is the marker hook the ::slotted(*) escape-hatch
  // rule below targets to make every action child grow.
  stretch: { actions: 'actions--stretch justify-stretch' },
} satisfies Record<CCardActionsJustify, object>;

const cardActions = tv({
  defaultVariants: {
    align: 'center',
    justify: 'start',
  },
  slots: {
    actions: 'm-0 p-0 flex gap-2',
    root: 'px-[var(--_c-card-padding-inline,28px)]',
  },
  variants: {
    align: alignVariants,
    justify: justifyVariants,
  },
});

const props = withDefaults(defineProps<CCardActionsProps>(), {
  align: 'center',
  justify: 'start',
});

// Attributes can deliver any string at runtime; unknown values fall back to
// the defaults.
const ui = computed(() =>
  cardActions({
    align: props.align in alignVariants ? props.align : 'center',
    justify: props.justify in justifyVariants ? props.justify : 'start',
  }),
);
</script>

<!--
  Escape-hatch CSS: `::slotted(...)` rules style consumer-provided
  light-DOM children (a contextual selector Tailwind utilities cannot express).
  When the row is `justify=stretch`, every action grows; a `c-button[fit]`
  always grows regardless of justify.
-->
<style>
.actions--stretch ::slotted(*) {
  flex: 1;
}

::slotted(c-button[fit]) {
  flex: 1;
}
</style>
