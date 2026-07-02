<template>
  <svg
    :class="ui.root()"
    :height="size"
    :style="{ width: `${size}px`, height: `${size}px`, color }"
    :width="size"
    part="root"
  >
    <circle
      :class="ui.circle()"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      :style="{
        strokeWidth: `${width}px`,
        strokeDasharray: 3.14 * size,
        transformOrigin: `${size / 2}px ${size / 2}px 0`,
        '--c-spinner-size': `${size}px`,
      }"
    />
  </svg>
</template>

<script setup lang="ts">
/**
 * @csspart root - The `<svg>` element that draws the spinning circle
 */
import { tv } from 'tailwind-variants';
import { computed } from 'vue';

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); the old
 * `--_c-spinner-*` indirection layer is dropped. Customization is via
 * `::part(root)` (ADR-0006).
 *
 * COLOUR CONTRACT: the stroke/fill come from `currentColor`
 * (`stroke-current` / `fill-current`), and the `color` prop is applied inline
 * on the SVG root as that element's `color`. The prop DEFAULTS TO
 * `var(--c-primary)` — the semantic primary role (ADR-0010), so a standalone
 * spinner is the brand colour in either theme, not the ambient text colour.
 *   - an explicit `color` prop still wins (e.g. c-select passes the primary role);
 *   - a PARENT that wants the spinner to TRACK its own colour passes
 *     `color="currentColor"` (c-switch's slider, c-loader's container do this),
 *     re-opening inheritance across the shadow boundary.
 * There is no `--c-spinner-color` override var.
 *
 * SIZE CONTRACT: driven by the `size` / `width` props (inline styles on the
 * `svg` / `circle`), not by size override vars.
 *
 * The spin animation is a bespoke dash-offset + 1080deg rotation that cannot
 * be expressed as Tailwind's `animate-spin`, so it lives in the escape-hatch
 * `<style>` below (ADR-0007) keyed by the `c-spinner-circle` marker class.
 */
const spinner = tv({
  slots: {
    circle:
      'c-spinner-circle fill-transparent stroke-current [stroke-linecap:round]',
    root: 'block fill-current overflow-visible',
  },
});

interface CSpinnerProps {
  /**
   * Color of the spinner
   *
   * @seeded from csc-ui — verify
   */
  color?: string;
  /**
   * Size of the spinner
   *
   * @seeded from csc-ui — verify
   */
  size?: number;
  /**
   * Width of the spinner
   *
   * @seeded from csc-ui — verify
   */
  width?: number;
}

const props = withDefaults(defineProps<CSpinnerProps>(), {
  color: 'var(--c-primary)',
  size: 24,
  width: 2,
});

// Radius leaves room for the stroke so a thick `width` doesn't spill past the
// size×size box (the SVG is `overflow-visible`). The inset is `max(2, width/2)`:
// for the original's thin strokes (width ≤ 4) this is exactly `size/2 - 2`
// — identical to the Stencil version — and only shrinks further when the
// stroke is thick enough to otherwise overflow.
const radius = computed(() => props.size / 2 - Math.max(2, props.width / 2));

const ui = computed(() => spinner());
</script>

<!--
  Escape-hatch CSS (ADR-0007): only the bespoke spin @keyframes (a 1080deg
  rotation combined with an oscillating stroke-dashoffset) and the rule that
  applies it. This is NOT expressible as Tailwind's `animate-spin`. The
  dashoffset values scale with the spinner size, exposed via the
  `--c-spinner-size` custom property set inline from the `size` prop.
-->
<style>
.c-spinner-circle {
  animation: c-spinner 2.5s linear infinite;
}

@keyframes c-spinner {
  0% {
    transform: rotate(0deg);
    stroke-dashoffset: calc(0.66 * var(--c-spinner-size));
  }

  50% {
    transform: rotate(720deg);
    stroke-dashoffset: calc(3.14 * var(--c-spinner-size));
  }

  100% {
    transform: rotate(1080deg);
    stroke-dashoffset: calc(0.66 * var(--c-spinner-size));
  }
}
</style>
