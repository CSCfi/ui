<template>
  <div
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
    :class="divider({ vertical })"
    part="root"
    role="separator"
  />
</template>

<script setup lang="ts">
/**
 * @csspart root - The separator line element itself
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';

/**
 * General-purpose separator. Used by `c-menu` to divide sections, but usable
 * anywhere (cards, layouts, toolbars). Styling lives entirely in this
 * `tailwind-variants` config (ADR-0004); consumer customization is via
 * `::part(root)` (ADR-0006). No `<style>` block needed — the host stays
 * `display: contents` (the global rule) and the `root` box carries the line,
 * so it lays out directly inside its parent.
 */
const divider = tv({
  base: 'border-0 bg-border',
  defaultVariants: { vertical: false },
  variants: {
    vertical: {
      false: 'block w-full h-px my-1',
      // No explicit height: `self-stretch` only applies when the cross size
      // is `auto` (a non-auto height makes flex fall back to start
      // alignment); `min-h-[1em]` is the floor for inline flow, where
      // stretching is inert.
      true: 'inline-block self-stretch w-px min-h-[1em] mx-1 align-middle',
    },
  },
});

interface CDividerProps {
  /** Render a vertical separator instead of the default horizontal one. */
  vertical?: boolean;
}

const props = withDefaults(defineProps<CDividerProps>(), {
  vertical: false,
});

// Custom-element boolean attrs arrive as '' / 'true' / 'false' strings.
const vertical = computed(() => coerceBoolean(props.vertical));
</script>
