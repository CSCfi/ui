<template>
  <div :class="ui.root()" :style="cssVars" part="root">
    <label v-if="label" :class="ui.label()" part="label">
      {{ label }} {{ ariaLabelInternal }}
    </label>

    <div :class="ui.wrapper()">
      <div
        v-if="!disableTooltip"
        :class="ui.tooltipWrapper()"
        aria-hidden="true"
      >
        <span
          :class="ui.tooltip()"
          :data-tooltip="`${formatNumber(+value)}${unit}`"
        />
      </div>

      <input
        :id="hostId || generatedId"
        ref="inputRef"
        :aria-label="ariaLabelInternal || label"
        :aria-valuemax="max"
        :aria-valuemin="min"
        :aria-valuenow="value"
        :aria-valuetext="`${value}${unit}`"
        :class="ui.input()"
        :disabled="disabled || undefined"
        :max
        :min
        :name="hostName || undefined"
        :step
        type="range"
        @input="onInput"
      />
    </div>

    <div :class="ui.ticks()" aria-hidden="true" part="ticks">
      <span
        v-for="(pos, i) in tickPositions"
        :key="i"
        :class="ui.tick({ active: isActive(Math.round(+pos)) })"
        :data-value="formatNumber(Math.round(+pos))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @csspart root - The outer wrapper containing the label, range input and track
 * @csspart label - The label element rendered above the slider
 * @csspart ticks - The visible track below the input, carrying the progress fill and tick marks
 */
import { tv } from 'tailwind-variants';
import {
  computed,
  onMounted,
  ref,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import { emitModelValue } from '../../shared/emitModelValue';

/** Events dispatched by `<c-slider>`. */
interface CSliderEvents {
  /**
   * Fired on every thumb movement, carrying the new slider value — a number
   * when the current `value` prop is a number, otherwise a string.
   */
  changeValue: number | string;
  /**
   * Native bubbling input event fired on every thumb movement so a plain Vue
   * `v-model` works without the `v-control` directive. No detail.
   */
  input: void;
  /**
   * v-model contract event fired on every thumb movement, carrying the new
   * slider value — a number when the current `value` prop is a number,
   * otherwise a string.
   */
  'update:value': number | string;
}

/**
 * Styling lives in this `tailwind-variants` config (ADR-0004); customization is
 * via `::part()` against the stamped part names (ADR-0006), not `--c-*` override
 * vars. The native `<input type=range>` pseudo-elements (thumb / track /
 * progress) and the tooltip bubble's `::before`/`::after` callout — none of
 * which Tailwind utilities can target — stay in the escape-hatch <style> below
 * (ADR-0007), authored directly against design tokens.
 *
 * The `c-slider__input` / `c-slider__tooltip` / `c-slider__ticks` marker
 * classes are the hooks those pseudo-element rules and the runtime-state CSS
 * vars (`--_c-slider-position`) target.
 */
const slider = tv({
  compoundVariants: [
    // An active tick is white, but only when ticks are actually rendered.
    {
      active: true,
      class: { tick: 'bg-on-primary' },
      ticks: true,
    },
  ],
  defaultVariants: {
    active: false,
    disabled: false,
    labels: false,
    ticks: false,
  },
  slots: {
    // The native range input; thumb/track styled via pseudo-elements (escape-hatch).
    input:
      'c-slider__input flex items-center appearance-none bg-transparent h-2 m-0 relative w-full',
    label: 'block mb-4 -mt-2',
    // `group` is the hover/focus-within anchor for the tooltip reveal below.
    root: 'c-slider__root group block isolate py-2',
    tick: 'c-slider__tick relative size-1 rounded-full text-xs',
    // The visual track: a gradient fill driven by --_c-slider-position.
    ticks:
      'c-slider__ticks flex items-center justify-between h-2 rounded-[100vw] -mt-2 mx-auto pointer-events-none relative -z-10 w-[calc(100%-16px)]',
    // The bubble: a circle that follows the thumb. It reveals on root
    // hover/focus-within via the `group` anchor on `root` (group-hover /
    // group-focus-within). Its horizontal `left` follows the thumb via the
    // runtime var --_c-slider-position; that lives in the escape-hatch <style>
    // (not a Tailwind arbitrary value), because a CSS-var underscore can't
    // survive the JS-string→class round-trip a `[...]` utility needs. The
    // ::before/::after callout also lives in the escape-hatch.
    tooltip:
      'c-slider__tooltip absolute inline-flex items-center justify-center size-6 rounded-full box-border pointer-events-none opacity-0 -translate-x-1/2 -translate-y-1 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.075,0.82,0.165,1)] group-hover:opacity-100 group-hover:-translate-y-2 group-focus-within:opacity-100 group-focus-within:-translate-y-2',
    tooltipWrapper: 'relative h-0 mx-0.5',
    wrapper: 'relative px-2.5',
  },
  variants: {
    active: {
      true: {},
    },
    disabled: {
      true: { ticks: 'c-slider__ticks--disabled' },
    },
    labels: {
      true: { root: 'pb-6', tick: 'c-slider__tick--labels' },
    },
    ticks: {
      true: { tick: 'c-slider__tick--ticks bg-border-strong' },
    },
  },
});

interface CSliderProps {
  /**
   * Aria label
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  ariaLabelInternal?: string;
  /**
   * Disable the slider
   *
   * @seeded from csc-ui — verify
   */
  disabled?: boolean;
  /**
   * Disable tooltip
   *
   * @seeded from csc-ui — verify
   */
  disableTooltip?: boolean;
  /**
   * Id of the element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostId?: string;
  /**
   * Id of the element
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  hostName?: string;
  /**
   * Label of the slider
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  label?: string;
  /**
   * Show tick labels
   *
   * @seeded from csc-ui — verify
   */
  labels?: boolean;
  /**
   * Max value
   *
   * @seeded from csc-ui — verify
   */
  max?: number | string;
  /**
   * Min value
   *
   * @seeded from csc-ui — verify
   */
  min?: number | string;
  /**
   * Segment count
   *
   * @seeded from csc-ui — verify
   */
  segments?: number | string;
  /**
   * Step
   *
   * @seeded from csc-ui — verify
   */
  step?: number | string;
  /**
   * Thow ticks
   *
   * @seeded from csc-ui — verify
   */
  ticks?: boolean;
  /**
   * Unit
   *
   * @seeded from csc-ui — verify
   * @freeform
   */
  unit?: string;
  /**
   * Value
   *
   * @seeded from csc-ui — verify
   */
  value?: number | string;
}

const props = withDefaults(defineProps<CSliderProps>(), {
  ariaLabelInternal: '',
  disabled: false,
  disableTooltip: false,
  hostId: '',
  hostName: '',
  label: '',
  labels: false,
  max: '100',
  min: '0',
  segments: '10',
  step: '1',
  ticks: false,
  unit: '%',
  value: '50',
});

const ui = computed(() =>
  slider({
    disabled: props.disabled,
    labels: props.labels,
    ticks: props.ticks,
  }),
);

const host = useHost();

const inputRef = useTemplateRef<HTMLInputElement>('inputRef');

const autoId = useId();

const generatedId = computed(() => `c-slider__${autoId}`);

const trackPosition = ref(0);

const tickPositions = ref<string[]>([]);

const formatNumber = (n: number, decimals = 0) =>
  new Intl.NumberFormat('fi-FI', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(n);

const calculateTickPositions = () => {
  tickPositions.value = Array.from({ length: +props.segments + 1 }, (_, i) =>
    String((i * +props.max) / +props.segments),
  );
};

const calculateTrackPosition = () => {
  trackPosition.value =
    ((+props.value - +props.min) / (+props.max - +props.min)) * 100;
};

const isActive = (value: number) =>
  trackPosition.value >= (100 / +props.max) * value;

const cssVars = computed(() => ({
  '--_c-slider-position': `${trackPosition.value}`,
}));

const onInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;

  // Typed against the event map so the emitted detail is compile-checked.
  const next: CSliderEvents['changeValue'] =
    typeof props.value === 'number' ? +v : v;
  // changeValue/update:value + native `input` (plain v-model) + host `value`
  // mirror. The value watch is visuals-only, so no loop.
  emitModelValue(host, next);
  // Don't wait for the consumer to push value back — update the track
  // fill immediately so the gradient and tooltip stay in sync with the
  // thumb during drag.
  trackPosition.value = ((+v - +props.min) / (+props.max - +props.min)) * 100;
};

watch(() => props.segments, calculateTickPositions);
watch(
  () => props.value,
  (v) => {
    calculateTrackPosition();
    requestAnimationFrame(() => {
      if (inputRef.value) inputRef.value.value = String(v);
    });
  },
);

onMounted(() => {
  calculateTrackPosition();
  calculateTickPositions();
  requestAnimationFrame(() => {
    if (inputRef.value) inputRef.value.value = String(props.value);
  });
});
</script>

<!--
  Escape-hatch CSS (ADR-0007): only constructs Tailwind utilities cannot
  express, authored directly against design tokens (ADR-0004) — no `--c-*`
  override-var indirection layer.

  What lives here and why:
  - Native range pseudo-elements (`::-webkit-slider-thumb`,
    `::-webkit-slider-runnable-track`, `::-webkit-slider-container`,
    `::-moz-range-thumb`) — form-control internals Tailwind can't target.
  - The track's `linear-gradient` progress fill, driven by the runtime-state
    var `--_c-slider-position` (set imperatively by the script; this is live
    value state, NOT the dropped theming-indirection layer).
  - The `input:active` / `input:focus-visible` state vars (`--_c-slider-outline`,
    `--_c-slider-thumb-scale`, `--_c-slider-thumb-shadow-size`) — they only feed
    the pseudo-elements above, so they belong with them.
  - The tooltip bubble's `::before`/`::after` callout (label box + arrow), a
    `content: attr(data-tooltip)` pseudo-element with layout.
-->
<style>
.c-slider__input {
  --_c-slider-outline: none;
  --_c-slider-thumb-scale: 1;
  --_c-slider-thumb-shadow-size: 8px;
}

.c-slider__input:focus-visible {
  --_c-slider-outline: 2px var(--c-primary) solid;
  outline: none;
}

.c-slider__input:active {
  --_c-slider-thumb-scale: 1.33;
  --_c-slider-thumb-shadow-size: 0;
}

.c-slider__input::-webkit-slider-runnable-track {
  width: calc(100% - 20px);
  margin: 0 -20px;
}

.c-slider__input::-webkit-slider-container {
  display: flex;
  padding: 0 10px;
}

.c-slider__input::-webkit-slider-thumb {
  appearance: none;
  background-color: var(--c-primary);
  border-radius: 100%;
  cursor: pointer;
  height: 24px;
  outline-offset: 4px;
  outline: var(--_c-slider-outline);
  position: relative;
  transform-origin: center;
  transform: scale(var(--_c-slider-thumb-scale));
  transition:
    box-shadow 0.3s cubic-bezier(0.075, 0.82, 0.165, 1),
    transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
  width: 24px;
  z-index: 1;
}

.c-slider__input::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 var(--_c-slider-thumb-shadow-size)
    color-mix(in srgb, var(--c-primary) 20%, transparent);
}

.c-slider__input::-moz-range-thumb {
  appearance: none;
  background-color: var(--c-primary);
  border-radius: 100%;
  border: 0;
  cursor: pointer;
  height: 24px;
  outline-offset: 2px;
  outline: var(--_c-slider-outline);
  position: relative;
  transform: scale(var(--_c-slider-thumb-scale));
  transition:
    box-shadow 0.3s cubic-bezier(0.075, 0.82, 0.165, 1),
    transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
  width: 24px;
  z-index: 1;
}

.c-slider__input[disabled]::-webkit-slider-thumb {
  background-color: var(--c-border-strong);
}

.c-slider__input[disabled]::-moz-range-thumb {
  background-color: var(--c-border-strong);
}

.c-slider__input[disabled] {
  pointer-events: none;
}

/* Track progress fill, driven by the live --_c-slider-position state var. */
.c-slider__ticks {
  background: linear-gradient(
    to right,
    var(--c-primary) calc(1% * var(--_c-slider-position)),
    var(--c-surface-muted) calc(1% * var(--_c-slider-position))
  );
}

.c-slider__ticks--disabled {
  background: linear-gradient(
    to right,
    var(--c-border-strong) calc(1% * var(--_c-slider-position)),
    var(--c-surface-muted) calc(1% * var(--_c-slider-position))
  );
}

.c-slider__tick--ticks:first-child,
.c-slider__tick--ticks:last-child {
  background-color: transparent;
}

.c-slider__tick--labels::after {
  content: attr(data-value);
  left: 2px;
  position: absolute;
  top: 16px;
  transform: translate(-50%);
}

/* Tooltip horizontal position follows the thumb via the live
 * --_c-slider-position state var. Lives here (not a Tailwind `left-[...]`
 * utility) because the var's leading underscore can't round-trip through a
 * JS-string class into a matching generated selector. */
.c-slider__tooltip {
  left: calc(1% * var(--_c-slider-position));
}

/* Tooltip callout: label box + arrow, a content:attr() pseudo with layout. */
.c-slider__tooltip::before {
  align-items: center;
  background: var(--c-on-surface);
  border-radius: 4px;
  bottom: 100%;
  color: var(--c-surface);
  content: attr(data-tooltip);
  display: inline-flex;
  flex-wrap: nowrap;
  height: 30px;
  padding: 6px;
  position: absolute;
  top: -42px;
  white-space: nowrap;

  @supports (corner-shape: squircle) {
    corner-shape: squircle;
    border-radius: 16px;
  }
}

.c-slider__tooltip::after {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--c-on-surface);
  content: '';
  height: 0;
  left: 50%;
  margin: -42px 0 0 -6px;
  position: absolute;
  width: 0;
}
</style>
