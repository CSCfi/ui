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
export type CLoginCardActionsAlign = 'center' | 'end' | 'start';

/**
 * Main-axis distribution of the slotted actions. `stretch` makes every action
 * grow to fill the row.
 */
export type CLoginCardActionsJustify =
  | 'center'
  | 'end'
  | 'space-around'
  | 'space-between'
  | 'start'
  | 'stretch';

export interface CLoginCardActionsProps {
  /**
   * Align the actions
   *
   * @seeded from csc-ui — verify
   */
  align?: CLoginCardActionsAlign;
  /**
   * Justify the actions
   *
   * @seeded from csc-ui — verify
   */
  justify?: CLoginCardActionsJustify;
}
</script>

<script setup lang="ts">
/**
 * @slot default - Login card actions
 *
 * @csspart root - The outer footer element
 * @csspart actions - The flex menu row laying out the slotted actions
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config; `root`
 * (the <footer>) and `actions` (the flex <menu> row) are the public parts.
 * The Stencil version delegated to <c-card-actions> with
 * `--_c-card-gap: 0`; the layout is inlined here so we don't nest a second
 * custom element (and its shadow boundary) just to zero a single var. The host
 * stays `display:contents` (global) and the box lives on the `root` element.
 * The `align`/`justify` props drive the flex alignment via variants.
 * `::slotted(...)` stretch rules stay in the escape-hatch <style>:
 * they target consumer light-DOM children.
 */
// Hoisted so the runtime guards below can test membership; the `satisfies`
// keeps the maps complete against the public unions.
const alignVariants = {
  center: { actions: 'items-center' },
  end: { actions: 'items-end' },
  start: { actions: 'items-start' },
} satisfies Record<CLoginCardActionsAlign, object>;

const justifyVariants = {
  center: { actions: 'justify-center' },
  end: { actions: 'justify-end' },
  'space-around': { actions: 'justify-around' },
  'space-between': { actions: 'justify-between' },
  start: { actions: 'justify-start' },
  // `actions--stretch` is the marker hook the ::slotted(*) escape-hatch
  // rule below targets to make every action child grow.
  stretch: { actions: 'actions--stretch justify-stretch' },
} satisfies Record<CLoginCardActionsJustify, object>;

const loginCardActions = tv({
  defaultVariants: {
    align: 'center',
    justify: 'start',
  },
  slots: {
    actions: 'm-0 p-0 flex gap-2 items-center',
    root: 'block p-0',
  },
  variants: {
    align: alignVariants,
    justify: justifyVariants,
  },
});

const props = withDefaults(defineProps<CLoginCardActionsProps>(), {
  align: 'center',
  justify: 'start',
});

// Attributes can deliver any string at runtime; unknown values fall back to
// the defaults.
const ui = computed(() =>
  loginCardActions({
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
