<template>
  <footer :class="ui.root()" part="root">
    <menu :class="ui.actions()" part="actions">
      <slot />
    </menu>
  </footer>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004); `root`
 * (the padded <footer>) and `actions` (the flex row) are the public parts
 * (ADR-0006). Horizontal padding keys off `--_c-card-gap` (the shared spacing
 * contract the parent c-card sets, inheriting across the shadow boundary) with
 * a 24px fallback. Vertical padding is intentionally absent — the parent card's
 * article already supplies `padding-block`. The `align`/`justify` props drive
 * the flex alignment via variants. `::slotted(...)` stretch rules stay in the
 * escape-hatch <style> (ADR-0007): they target consumer light-DOM children.
 */
const cardActions = tv({
  defaultVariants: {
    align: 'center',
    justify: 'start',
  },
  slots: {
    actions: 'm-0 p-0 flex gap-2',
    root: 'px-[var(--_c-card-gap,24px)]',
  },
  variants: {
    align: {
      center: { actions: 'items-center' },
      end: { actions: 'items-end' },
      start: { actions: 'items-start' },
    },
    justify: {
      center: { actions: 'justify-center' },
      end: { actions: 'justify-end' },
      'space-around': { actions: 'justify-around' },
      'space-between': { actions: 'justify-between' },
      start: { actions: 'justify-start' },
      // `actions--stretch` is the marker hook the ::slotted(*) escape-hatch
      // rule below targets to make every action child grow.
      stretch: { actions: 'actions--stretch justify-stretch' },
    },
  },
});

interface CCardActionsProps {
  align?: string;
  justify?: string;
}

const props = withDefaults(defineProps<CCardActionsProps>(), {
  align: 'center',
  justify: 'start',
});

const ui = computed(() =>
  cardActions({
    align: props.align as 'center' | 'end' | 'start',
    justify: props.justify as
      | 'center'
      | 'end'
      | 'space-around'
      | 'space-between'
      | 'start'
      | 'stretch',
  }),
);
</script>

<!--
  Escape-hatch CSS (ADR-0007): `::slotted(...)` rules style consumer-provided
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
