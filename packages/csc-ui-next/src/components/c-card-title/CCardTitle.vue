<template>
  <header ref="rootRef" :class="ui.root()" part="root">
    <div :class="ui.header()" part="header">
      <p :class="ui.heading()" part="heading"><slot /></p>

      <div :class="ui.underline()" part="underline" />
    </div>

    <div v-show="hasActions" :class="ui.actions()" part="actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004); the
 * stamped parts (`root`, `header`, `heading`, `underline`, `actions`) are the
 * public customization surface (ADR-0006). The typography that the original
 * carried on `:host` now lives on the `root` element. Colours come straight
 * from the global tokens (`--c-text-system` text, `--c-primary-600` underline)
 * — the old `--c-card-title-color` / `--c-card-title-underline-color` override
 * indirection is dropped. `padding-inline` keys off `--_c-card-gap` (the shared
 * spacing contract the parent c-card sets, inheriting across the shadow
 * boundary) with a 24px fallback. The `actions` variant turns the header row
 * into a side-by-side flex layout when the `actions` slot has content.
 */
const cardTitle = tv({
  defaultVariants: {
    actions: false,
  },
  slots: {
    actions: 'flex flex-wrap-reverse items-center justify-end gap-2 flex-1',
    header: '',
    heading: 'm-0',
    root: 'block px-[var(--_c-card-gap,24px)] uppercase text-balance font-medium text-base text-on-surface-muted [font-family:var(--c-font-family)]',
    underline: 'mt-2.5 h-1 w-11 rounded bg-primary',
  },
  variants: {
    actions: {
      true: {
        root: 'flex flex-wrap items-start flex-[0_0_auto] gap-2',
      },
    },
  },
});

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasActions = useHasSlot(rootRef, 'actions');

const ui = computed(() => cardTitle({ actions: hasActions.value }));
</script>
