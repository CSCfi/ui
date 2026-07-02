<template>
  <div :class="ui.root()" class="c-backdrop" part="root" />
</template>

<script setup lang="ts">
/**
 * @csspart root - The full-screen overlay element that dims and blurs the page behind it
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); consumer
 * customization is via `::part()` (ADR-0006).
 *
 * The static `.c-backdrop` class is RETAINED on the root element: c-modal
 * reaches into this shadow root with `querySelector('.c-backdrop')` and toggles
 * `.opening` / `.closing` imperatively to drive the fade animations. Those
 * @keyframes and their class hooks can't be utilities, so they stay in the
 * escape-hatch <style> below (ADR-0007).
 */
const backdrop = tv({
  defaultVariants: {
    blur: true,
  },
  slots: {
    // Full-screen overlay, initially transparent and click-through; c-modal
    // fades it in/out via the .opening/.closing classes.
    root: 'block fixed inset-0 z-[1000] bg-scrim/50 opacity-0 pointer-events-none',
  },
  variants: {
    blur: { true: { root: 'backdrop-blur-[4px]' } },
  },
});

interface CBackdropProps {
  /**
   * Disable backdrop blur effect
   *
   * @seeded from csc-ui — verify
   */
  disableBackdropBlur?: boolean;
}

const props = withDefaults(defineProps<CBackdropProps>(), {
  disableBackdropBlur: false,
});

const ui = computed(() => backdrop({ blur: !props.disableBackdropBlur }));
</script>

<!--
  Escape-hatch CSS (ADR-0007): @keyframes plus the `.opening` / `.closing` class
  hooks that c-modal toggles imperatively through this shadow root. The base
  overlay look and the blur variant live in the `tv` config above.
-->
<style>
/* The opening / closing classes are toggled imperatively by c-modal
 * via the backdrop's shadow root — fade-in / fade-out animations. */
@media (prefers-reduced-motion: no-preference) {
  .c-backdrop.opening {
    animation: c-backdrop-fadein 0.3s var(--ease-standard) forwards;
  }
  .c-backdrop.closing {
    animation: c-backdrop-fadeout 0.3s var(--ease-standard) forwards;
  }
}

@keyframes c-backdrop-fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes c-backdrop-fadeout {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
