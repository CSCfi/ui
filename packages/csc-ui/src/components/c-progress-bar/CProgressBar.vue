<template>
  <div :class="ui.root()" part="root">
    <div
      :aria-label="label || (controlAttrs['aria-label'] as string) || undefined"
      :aria-valuenow="indeterminate ? undefined : String(safeValue)"
      :class="ui.track({ singleLine })"
      aria-valuemax="100"
      aria-valuemin="0"
      part="track"
      role="progressbar"
    >
      <span :class="ui.clip()">
        <span
          :class="ui.bar({ indeterminate })"
          :style="indeterminate ? undefined : { width: `${safeValue}%` }"
          part="bar"
        />
      </span>
    </div>

    <div
      v-if="!indeterminate && !hideDetails"
      :class="ui.details({ singleLine, negative: value < 0 })"
      part="details"
    >
      {{ value }} % {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @csspart root - The outer flex wrapper around the progress track and the details line
 * @csspart track - The progress track: the ground the bar grows along, carrying the progressbar role. Its padding is the frame around the bar
 * @csspart bar - The bar showing the value: the fill, or the looping sweep while indeterminate
 * @csspart details - The percentage and label text line
 */
import { tv } from 'tailwind-variants';
import { computed, onMounted, useHost, watchEffect } from 'vue';

import { useControlAttrs } from '../../shared/useControlAttrs';
import { useIdReferences } from '../../shared/useIdReferences';

// Multi-root-ish template still writes to the host below — keep fallthrough
// attrs on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });

// ARIA attributes on the element reach the progress track.
const { controlAttrs } = useControlAttrs();

/**
 * The progress track and the bar are plain elements, so `::part(track)` and
 * `::part(bar)` reach every colour and size (ADR-0086). The track owns the
 * geometry: 16px tall, its 4px padding the frame, and the bar fills its
 * content box. `clip` (internal) rounds that content box, so the indeterminate
 * sweep stays inside the frame. Both paint opaque tints at the 75% the 3.x
 * see-through bar showed (ADR-0082), so a consumer colour paints as written.
 * The track pins the tint scale to 1: a tinted container halves a tint's
 * share for the labels on it, and the bar carries none, so there too it mixes
 * into the container what its see-through look showed.
 *
 * In a forced-colors mode a background is forced to `Canvas`, so the bar
 * paints `Highlight` (over a consumer colour too) and the track outlines in
 * `CanvasText`.
 */
const progress = tv({
  defaultVariants: {
    indeterminate: false,
    negative: false,
    singleLine: false,
  },
  slots: {
    bar: 'block h-full rounded-[inherit] bg-tint-primary/75 transition-[width] duration-300 ease-in-out forced-colors:bg-[Highlight]! forced-colors:forced-color-adjust-none',
    clip: 'relative block h-full transform-gpu overflow-hidden rounded-[inherit]',
    details: 'mt-0.5 basis-full pl-4 text-end text-sm whitespace-nowrap',
    root: 'flex flex-wrap items-center',
    track:
      'h-4 w-full basis-full rounded-full bg-tint-surface-muted/75 p-1 [--_c-tint-scale:1] forced-colors:outline forced-colors:outline-[CanvasText]',
  },
  variants: {
    // The sweep: half the track wide, starting a track's width to the left.
    indeterminate: {
      true: {
        bar: 'absolute top-0 -left-full w-1/2 origin-left animate-[c-progress-indeterminate_2s_linear_infinite]',
      },
    },
    negative: {
      true: { details: 'text-on-surface-error' },
    },
    singleLine: {
      true: {
        details: 'flex-none',
        track: 'flex-1',
      },
    },
  },
});

const ui = computed(() => progress());

interface CProgressBarProps {
  /**
   * Hides the details line (the percentage and `label`); `label` still
   * names the progress bar.
   */
  hideDetails?: boolean;

  /**
   * Turns the bar into a looping sweep for work of unknown duration,
   * hiding the details line and exposing no value.
   */
  indeterminate?: boolean;

  /**
   * What is progressing: shown after the percentage, and the progress bar's
   * accessible name.
   *
   * @freeform
   */
  label?: string;

  /**
   * Places the details line beside the progress track instead of below it.
   */
  singleLine?: boolean;

  /**
   * Completion percentage, 0 to 100. The bar clamps a value outside that
   * range; the details line shows it as given, a negative one in the error
   * colour.
   */
  value?: number;
}

const props = withDefaults(defineProps<CProgressBarProps>(), {
  hideDetails: false,
  indeterminate: false,
  label: '',
  singleLine: false,
  value: 0,
});

const safeValue = computed(() => {
  if (props.value >= 0 && props.value <= 100) return props.value;

  if (props.value < 0) return 0;

  return 100;
});

const host = useHost();
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    // Busy only while indeterminate: a determinate bar announces its value
    // updates, which aria-busy="true" would tell AT to defer.
    host.setAttribute('aria-busy', props.indeterminate.toString());

    // The percentage tooltip, but none while there is no value to show.
    if (props.indeterminate) host.removeAttribute('title');
    else host.setAttribute('title', `${safeValue.value} %`);
  });
});

// The page's id references on the element reach the element carrying its role.
useIdReferences('[role="progressbar"]');
</script>

<!--
  Escape-hatch CSS: the indeterminate sweep's keyframes, which Tailwind
  utilities cannot declare. The sweep keeps moving under reduced motion: the
  motion is the information (ADR-0057).
-->
<style>
@keyframes c-progress-indeterminate {
  0% {
    transform: translateX(100%) scaleX(1);
  }
  30% {
    transform: translateX(170%) scaleX(1.75);
  }
  70% {
    transform: translateX(500%) scaleX(0.1);
  }
  100% {
    transform: translateX(500%) scaleX(0.1);
  }
}
</style>
