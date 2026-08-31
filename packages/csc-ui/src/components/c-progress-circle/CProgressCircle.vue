<template>
  <div
    ref="rootRef"
    :aria-valuenow="safeValue"
    :class="ui.root()"
    aria-valuemax="100"
    aria-valuemin="0"
    part="root"
    role="progressbar"
  >
    <svg :class="ui.svg()" :height="size" :width="size" aria-hidden="true">
      <circle
        :class="ui.track()"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :style="{ strokeWidth: `${width}px` }"
        part="track"
      />

      <circle
        :class="ui.bar({ empty: safeValue === 0 })"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :style="{
          strokeWidth: `${barWidth}px`,
          strokeDasharray: `${circumference}px`,
          strokeDashoffset: `${barOffset}px`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
        }"
        part="bar"
      />
    </svg>

    <div v-show="hasSlotContent" :class="ui.content()" part="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @slot default - Optional content centered inside the circle, e.g. '57%' or an icon
 *
 * @csspart root - The wrapper around the ring and the centered content
 * @csspart track - The background ring (SVG circle)
 * @csspart bar - The value arc (SVG circle)
 * @csspart content - The centered slot-content wrapper
 */
import { tv } from 'tailwind-variants';
import { computed, useTemplateRef } from 'vue';

import { useHasSlot } from '../../shared/useHasSlot';

/**
 * Styling lives in this `tailwind-variants` config. Customization is via the
 * stamped parts.
 *
 * DETERMINATE-ONLY: there is no indeterminate mode by design — circular
 * unknown-duration waiting is `c-spinner`'s job (see CONTEXT.md,
 * "Progress & loading").
 *
 * COLOUR CONTRACT: the value arc strokes the primary role and the track the
 * muted surface role, matching c-progress-bar. There is deliberately no
 * `color` prop (`c-spinner`'s exists only for cross-shadow embedding by
 * parent components); consumers restyle via `::part(bar)` / `::part(track)`,
 * which is safe because stroke colour — unlike stroke width — does not feed
 * the radius math.
 *
 * SIZE CONTRACT: geometry is driven by the `size` / `width` props (inline
 * styles on the `svg` / `circle`s), because the circle radius and the dash
 * lengths are computed from them.
 *
 * The arc is a single full-circumference dash on the `bar` circle; its
 * dash offset hides the un-progressed remainder and transitions on value
 * changes (parity with the bar's fill transition). `-rotate-90` moves the
 * SVG's 3-o'clock start point to the top. The stroke ends are rounded
 * (parity with the bar's rounded fill), so at value 0 the zero-length dash
 * would still paint its caps as a dot — the `empty` variant hides the arc
 * instead, with opacity in the transition list so leaving 0 fades in rather
 * than pops.
 *
 * A11Y: the root div is the `role="progressbar"` element. `inheritAttrs`
 * stays on (the default) on purpose: a consumer's `aria-label` set on the
 * host falls through onto this root, naming the progressbar.
 */
const progressCircle = tv({
  defaultVariants: {
    empty: false,
  },
  slots: {
    bar: '-rotate-90 fill-transparent stroke-primary [stroke-linecap:round] transition-[stroke-dashoffset,opacity] duration-300 ease-in-out',
    content: 'absolute inset-0 flex items-center justify-center',
    root: 'relative inline-flex items-center justify-center align-middle',
    svg: 'block overflow-visible',
    track: 'fill-transparent stroke-surface-muted',
  },
  variants: {
    empty: {
      true: { bar: 'opacity-0' },
    },
  },
});

const ui = computed(() => progressCircle());

export interface CProgressCircleProps {
  /**
   * Diameter of the circle in pixels
   */
  size?: number;
  /**
   * Progress value in percentage (0 to 100)
   */
  value?: number;
  /**
   * Stroke width of the track in pixels; the value arc draws at half this
   * width, inset within the track
   */
  width?: number;
}

const props = withDefaults(defineProps<CProgressCircleProps>(), {
  size: 32,
  value: 0,
  width: 6,
});

const safeValue = computed(() => {
  if (props.value >= 0 && props.value <= 100) return props.value;

  if (props.value < 0) return 0;

  return 100;
});

// The radius leaves room for the stroke: the track's outer edge lands exactly
// on the size×size box (r + width/2 = size/2), so the ring never spills past
// the declared size.
const radius = computed(() => Math.max((props.size - props.width) / 2, 0));

// The value arc is inset within the track, mirroring c-progress-bar's anatomy
// (an 8px fill inside a 16px track): same centerline radius, half the track's
// stroke width, leaving a width/4 rim of track visible on either side.
const barWidth = computed(() => props.width / 2);

const circumference = computed(() => 2 * Math.PI * radius.value);

const barOffset = computed(
  () => circumference.value * (1 - safeValue.value / 100),
);

const rootRef = useTemplateRef<HTMLElement>('rootRef');

const hasSlotContent = useHasSlot(rootRef, '');
</script>
