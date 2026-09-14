<template>
  <div :class="ui.root()" part="heading-row">
    <span :class="ui.heading()" part="heading">{{ heading }}</span>

    <button
      :aria-label="closeLabel"
      :class="ui.close()"
      part="close"
      type="button"
      @click="emit('close')"
    >
      <svg aria-hidden="true" class="size-6 fill-current" viewBox="0 0 24 24">
        <path :d="mdiClose" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * Internal shared heading row of a **fullscreen panel** (CONTEXT.md,
 * ADR-0050): the field's label as the panel's heading, and the close button
 * — the one exit a phone user has besides picking an option. NOT a
 * registered custom element — imported into the value-selection fields'
 * templates and rendered inside their shadow roots, so the stamped parts
 * (`heading-row`, `heading`, `close`) join each host's `::part()` contract
 * (the analyzer merges them, as for SelectionIndicator.vue). Rendered only
 * while the panel is in its fullscreen layout.
 *
 * No `<style>` block on purpose: a non-element SFC has no shadow root of its
 * own to adopt a per-type sheet into. Semantic-token utilities only.
 */
import { mdiClose } from '@mdi/js';
import { tv } from 'tailwind-variants';

const headingRow = tv({
  slots: {
    // A 44px touch target on a 56px row; the focus ring is the primary
    // outline every button in the library draws.
    close:
      'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-on-surface-muted outline-none hover:bg-primary-subtle hover:text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary',
    heading:
      'min-w-0 flex-1 truncate text-base font-semibold leading-6 text-on-surface',
    root: 'flex min-h-14 items-center gap-2 border-b border-solid border-divider pl-4 pr-1.5',
  },
});

const ui = headingRow();

defineProps<{
  /** Accessible label of the close button. */
  closeLabel: string;
  /** The field's label, shown as the panel heading. */
  heading: string;
}>();

const emit = defineEmits<{ close: [] }>();
</script>
