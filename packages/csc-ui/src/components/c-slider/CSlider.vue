<template>
  <div :class="ui.root()" :style="cssVars" part="root">
    <form-label
      v-if="label"
      :class="ui.label()"
      :html-for="generatedId"
      :label
      part="label"
    />

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
        :id="generatedId"
        ref="inputRef"
        :aria-label="hostAriaLabel"
        :aria-valuemax="max"
        :aria-valuemin="min"
        :aria-valuenow="value"
        :aria-valuetext="`${value}${unit}`"
        :class="ui.input()"
        :disabled="disabled || undefined"
        :max
        :min
        :name="name || undefined"
        :step
        type="range"
        @change="onChange"
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
  useAttrs,
  useHost,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import FormLabel from '../../shared/FormLabel.vue';
import { emitModelInput, emitModelSettled } from '../../shared/valueEvents';

// The host's `aria-label` names the range input (below); without this it
// would also fall through onto the shadow `[part=root]` box.
defineOptions({ inheritAttrs: false });

/** Events dispatched by `<c-slider>`. */
interface CSliderEvents {
  /**
   * Fired when a move is committed — the release that ends a drag, or each
   * arrow-key step — carrying the value.
   */
  change: number;

  /**
   * Native bubbling input event fired on every thumb movement so a plain Vue
   * `v-model` stays in sync. No detail.
   */
  input: void;

  /**
   * v-model contract event fired on every thumb movement, carrying the new
   * value.
   */
  'update:value': number;
}

/**
 * Styling lives in this `tailwind-variants` config; customization is
 * via `::part()` against the stamped part names, not `--c-*` override
 * vars. The native `<input type=range>` pseudo-elements (thumb / track /
 * progress) and the tooltip bubble's `::before`/`::after` callout — none of
 * which Tailwind utilities can target — stay in the escape-hatch <style> below,
 * authored directly against design tokens.
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
      'c-slider__input relative m-0 flex h-2 w-full appearance-none items-center bg-transparent',
    label: '-mt-2 mb-4 block',
    // `group` is the hover/focus-within anchor for the tooltip reveal below.
    root: 'c-slider__root group isolate block py-2',
    tick: 'c-slider__tick relative size-1 rounded-full text-xs',
    // The visual track: a gradient fill driven by --_c-slider-position.
    ticks:
      'c-slider__ticks pointer-events-none relative -z-10 mx-auto -mt-2 flex h-2 w-[calc(100%-16px)] items-center justify-between rounded-[100vw]',
    // The bubble: a circle that follows the thumb. It reveals on root
    // hover, press (`group-active`: the pointer is on the thumb — the only
    // trigger a touch has) and focus-within via the `group` anchor on
    // `root`, instantly (`duration-0` in every revealed state; the 300ms
    // transition only plays on hide). Its horizontal `left` follows the thumb via the
    // runtime var --_c-slider-position; that lives in the escape-hatch <style>
    // (not a Tailwind arbitrary value), because a CSS-var underscore can't
    // survive the JS-string→class round-trip a `[...]` utility needs. The
    // ::before/::after callout also lives in the escape-hatch.
    tooltip:
      'c-slider__tooltip pointer-events-none absolute box-border inline-flex size-6 -translate-x-1/2 -translate-y-1 items-center justify-center rounded-full opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.075,0.82,0.165,1)] group-focus-within:-translate-y-2 group-focus-within:opacity-100 group-focus-within:duration-0 group-hover:-translate-y-2 group-hover:opacity-100 group-hover:duration-0 group-active:-translate-y-2 group-active:opacity-100 group-active:duration-0',
    tooltipWrapper: 'relative mx-0.5 h-0',
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

  /** The largest value. */
  max?: number;

  /** The smallest value. */
  min?: number;

  /**
   * `name` of the inner range input. The component is not
   * form-associated, so it does not submit with a `<form>`.
   *
   * @freeform
   */
  name?: string;

  /** Number of segments the tick marks divide the track into. */
  segments?: number;

  /** Step between values. */
  step?: number;

  /**
   * Thow ticks
   *
   * @seeded from csc-ui — verify
   */
  ticks?: boolean;

  /**
   * Unit shown after the value in the tooltip and read with it, e.g. `%`.
   *
   * @freeform
   */
  unit?: string;

  /** The value, a number between `min` and `max`. */
  value?: number;
}

const props = withDefaults(defineProps<CSliderProps>(), {
  disabled: false,
  disableTooltip: false,
  label: '',
  labels: false,
  max: 100,
  min: 0,
  name: '',
  segments: 10,
  step: 1,
  ticks: false,
  unit: '',
  value: 50,
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

// A host `aria-label` (the 3.x attribute) names the range input; a visible
// `label` names it through `<label for>` instead.
const attrs = useAttrs();

const hostAriaLabel = computed(
  () => (attrs.ariaLabel ?? attrs['aria-label']) as string | undefined,
);

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

// Typed against the event map so the emitted detail is compile-checked.
const valueOf = (e: Event): CSliderEvents['change'] => {
  return Number((e.target as HTMLInputElement).value);
};

// The inner range input's own timing: `input` on every move, `change` on the
// release that ends a drag and on each arrow-key step.
const onInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;

  // The value watch is visuals-only, so the host `value` mirror doesn't loop.
  emitModelInput(host, valueOf(e));
  // Don't wait for the consumer to push value back — update the track
  // fill immediately so the gradient and tooltip stay in sync with the
  // thumb during drag.
  trackPosition.value = ((+v - +props.min) / (+props.max - +props.min)) * 100;
};

// A native `change` does not cross the shadow boundary; the host sends its own.
const onChange = (e: Event) => emitModelSettled(host, valueOf(e));

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
  Escape-hatch CSS: only constructs Tailwind utilities cannot
  express, authored directly against design tokens — no `--c-*`
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
