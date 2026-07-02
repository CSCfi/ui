<template>
  <span :class="spacer()" part="root" />
</template>

<script setup lang="ts">
/**
 * Spacer component for flex containers
 *
 * @csspart root - The flex-filler element that grows to consume the free space
 *
 * @seeded from csc-ui — verify
 */
import { tv } from 'tailwind-variants';

/**
 * Styling lives entirely in this `tailwind-variants` config (ADR-0004). The
 * spacer is a single flex-filler region; the host stays `display:contents`
 * (global) and the inner `root` element carries the layout. Customization is
 * via `::part(root)` (ADR-0006); there is no `override` prop.
 *
 * The original `:host{flex-grow:1 !important}` becomes `grow!` on the root.
 * The `!important` is preserved because consumers rely on the spacer winning
 * over sibling flex-grow declarations.
 */
const spacer = tv({
  base: 'grow!',
});
</script>
