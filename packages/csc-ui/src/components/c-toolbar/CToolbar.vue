<template>
  <div :class="ui.root()" part="root">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Content of toolbar
 * @csspart root - The toolbar bar itself: pinned to the top of its scroll container by default, in flow when `static`
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

import { coerceBoolean } from '../../shared/coerceBoolean';

/**
 * Styling lives entirely in this `tailwind-variants` config; consumer
 * customization is via `::part(root)`.
 *
 * The host is `display:contents` globally, so the bar is the inner `root`
 * element — an in-flow item of whatever contains the toolbar. In c-main's
 * dashboard grid the root itself claims the `toolbar` area (`grid-area` on the
 * boxless host would be ignored; outside a grid the declaration is inert).
 * Pinned (the default) is `position: sticky`
 * at the top of the nearest scroll container: the document in the dashboard
 * layout, since c-main grows with its content (ADR-0051). The bar occupies its
 * own row, so no spacer is needed, and a banner slotted above it simply
 * scrolls away before the bar pins. `static` leaves the bar in flow so it
 * scrolls away with the page; it is positioned `relative` (not `static`) so
 * `z-10` keeps its shadow above positioned page content. The height is the
 * shared `--spacing-toolbar` theme value (`h-toolbar`), which c-main also
 * reads to offset the pinned side navigation.
 */
const toolbar = tv({
  defaultVariants: {
    static: false,
  },
  slots: {
    root: 'z-10 flex h-toolbar w-full items-center gap-x-3 px-4 bg-surface-raised text-on-surface-muted shadow-[2px_4px_10px_#00000029] border-b border-border [grid-area:toolbar]',
  },
  variants: {
    static: {
      // Pinned: sticks to the top of the scroll container.
      false: { root: 'sticky top-0' },
      // In flow: leaves with the page content.
      true: { root: 'relative' },
    },
  },
});

interface CToolbarProps {
  /**
   * Keep the toolbar in the page flow so it scrolls away with the content
   * instead of staying pinned to the top of its scroll container
   */
  static?: boolean;
}

const props = withDefaults(defineProps<CToolbarProps>(), {
  static: false,
});

// Keep consumer fallthrough attrs (class/style) on the host: a host class
// landing on the root would collide with the positioning utilities (the 3.x
// `class="relative"` switch is gone — use the `static` prop).
defineOptions({ inheritAttrs: false });

const ui = computed(() => toolbar({ static: coerceBoolean(props.static) }));
</script>
