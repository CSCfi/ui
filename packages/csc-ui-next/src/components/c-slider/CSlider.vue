<template>
  <div :style="cssVars">
    <label v-if="label" class="c-slider__label">
      {{ label }} {{ ariaLabelInternal }}
    </label>

    <div class="c-slider__wrapper">
      <div
        v-if="!disableTooltip"
        class="c-slider__tooltip-wrapper"
        aria-hidden="true"
      >
        <span :data-tooltip="`${formatNumber(+value)}${unit}`" />
      </div>

      <input
        ref="input"
        type="range"
        :aria-label="ariaLabelInternal || label"
        :aria-valuenow="value"
        :aria-valuetext="`${value}${unit}`"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :name="hostName || undefined"
        :id="hostId || generatedId"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled || undefined"
        @input="onInput"
      />
    </div>

    <div
      class="c-slider__ticks"
      :class="{ 'c-slider__ticks--disabled': disabled }"
      aria-hidden="true"
    >
      <span
        v-for="(pos, i) in tickPositions"
        :key="i"
        :class="{
          active: isActive(Math.round(+pos)),
          ticks: ticks,
          labels: labels,
        }"
        :data-value="formatNumber(Math.round(+pos))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useHost, useTemplateRef, watch } from 'vue';

const props = defineProps({
  hostId: { type: String, default: '' },
  hostName: { type: String, default: '' },
  ariaLabelInternal: { type: String, default: '' },
  max: { type: [String, Number], default: '100' },
  min: { type: [String, Number], default: '0' },
  step: { type: [String, Number], default: '1' },
  value: { type: [String, Number], default: '50' },
  unit: { type: String, default: '%' },
  ticks: { type: Boolean, default: false },
  labels: { type: Boolean, default: false },
  disableTooltip: { type: Boolean, default: false },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  segments: { type: [String, Number], default: '10' },
});

const host = useHost();
const input = useTemplateRef<HTMLInputElement>('input');
let uid = 0;
const generatedId = computed(() => `c-slider__${uid}`);

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

const dispatchValue = (value: unknown) => {
  host?.dispatchEvent(new CustomEvent('changeValue', { detail: value }));
  host?.dispatchEvent(new CustomEvent('update:value', { detail: value }));
};

const onInput = (e: Event) => {
  const v = (e.target as HTMLInputElement).value;
  const next = typeof props.value === 'number' ? +v : v;
  dispatchValue(next);
  // Don't wait for the consumer to push value back — update the track
  // fill immediately so the gradient and tooltip stay in sync with the
  // thumb during drag.
  trackPosition.value =
    ((+v - +props.min) / (+props.max - +props.min)) * 100;
};

watch(() => props.segments, calculateTickPositions);
watch(
  () => props.value,
  (v) => {
    calculateTrackPosition();
    requestAnimationFrame(() => {
      if (input.value) input.value.value = String(v);
    });
  },
);

onMounted(() => {
  uid += 1;
  if (host) host.classList.toggle('c-slider--labels', props.labels);
  calculateTrackPosition();
  calculateTickPositions();
  requestAnimationFrame(() => {
    if (input.value) input.value.value = String(props.value);
  });
});
</script>

<style>
:host {
  --_c-slider-background-color-active-disabled: var(--c-slider-background-color-active-disabled, var(--c-tertiary-400));
  --_c-slider-background-color-active: var(--c-slider-background-color-active, var(--c-primary-500));
  --_c-slider-background-color-disabled: var(--c-slider-background-color-disabled, rgba(var(--c-tertiary-rgb), 0.2));
  --_c-slider-background-color: var(--c-slider-background-color, rgba(var(--c-tertiary-rgb), 0.2));
  --_c-slider-thumb-background-color-disabled: var(--c-slider-thumb-background-color-disabled, var(--c-tertiary-500));
  --_c-slider-thumb-background-color-hover: var(--c-slider-thumb-background-color-hover, rgba(var(--c-primary-rgb), 0.2));
  --_c-slider-thumb-background-color: var(--c-slider-thumb-background-color, var(--c-primary-600));
  --_c-slider-tick-color-active: var(--c-slider-tick-color-active, var(--c-white));
  --_c-slider-tick-color: var(--c-slider-tick-color, var(--c-tertiary-500));
  --_c-slider-tooltip-background-color: var(--c-slider-tooltip-background-color, var(--c-primary-900));
  --_c-slider-tooltip-text-color: var(--c-slider-tooltip-text-color, var(--c-white));

  --_c-slider-outline: none;
  --_c-slider-thumb-scale: 1;
  --_c-slider-thumb-shadow-size: 8px;
  --_c-slider-tooltip-opacity: 0;
  --_c-slider-tooltip-y: -4px;

  display: block;
}

:host > div { isolation: isolate; padding-block: 8px; }

:host(.c-slider--labels) > div { padding-bottom: 24px; }

:host(:focus-within),
:host(:hover) {
  --_c-slider-tooltip-opacity: 1;
  --_c-slider-tooltip-y: -8px;
}

.c-slider__label {
  display: block;
  margin-bottom: 16px;
  margin-top: -8px;
}

.c-slider__wrapper {
  padding-inline: 10px;
  position: relative;
}

input[type='range'] {
  align-items: center;
  appearance: none;
  background-color: transparent;
  display: flex;
  height: 8px;
  margin: 0;
  position: relative;
  width: 100%;
}

input[type='range']:focus-visible {
  --_c-slider-outline: 2px var(--_c-slider-thumb-background-color) solid;
  outline: none;
}

input[type='range']::-webkit-slider-runnable-track {
  width: calc(100% - 20px);
  margin: 0 -20px;
}

input[type='range']:active {
  --_c-slider-thumb-scale: 1.33;
  --_c-slider-thumb-shadow-size: 0;
}

input[type='range']::-webkit-slider-container {
  display: flex;
  padding: 0 10px;
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  background-color: var(--_c-slider-thumb-background-color);
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

input[type='range']::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 var(--_c-slider-thumb-shadow-size)
    var(--_c-slider-thumb-background-color-hover);
}

input[type='range']::-moz-range-thumb {
  appearance: none;
  background-color: var(--_c-slider-thumb-background-color);
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

input[type='range'][disabled] {
  --_c-slider-background-color: var(--_c-slider-background-color-disabled);
  --_c-slider-background-color-active: var(--_c-slider-background-color-active-disabled);
  --_c-slider-thumb-background-color: var(--_c-slider-thumb-background-color-disabled);
  pointer-events: none;
}

.c-slider__tooltip-wrapper {
  height: 0;
  margin-inline: 2px;
  position: relative;
}

.c-slider__tooltip-wrapper span {
  align-items: center;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-flex;
  height: 24px;
  justify-content: center;
  left: calc(1% * var(--_c-slider-position));
  opacity: var(--_c-slider-tooltip-opacity);
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, var(--_c-slider-tooltip-y));
  transition:
    opacity 0.3s cubic-bezier(0.075, 0.82, 0.165, 1),
    transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
  width: 24px;
}

.c-slider__tooltip-wrapper span::before {
  align-items: center;
  background: var(--_c-slider-tooltip-background-color);
  border-radius: 4px;
  bottom: 100%;
  color: var(--_c-slider-tooltip-text-color);
  content: attr(data-tooltip);
  display: inline-flex;
  flex-wrap: nowrap;
  height: 30px;
  padding: 6px;
  position: absolute;
  top: -42px;
  white-space: nowrap;
}

.c-slider__tooltip-wrapper span::after {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--_c-slider-tooltip-background-color);
  content: '';
  height: 0;
  left: 50%;
  margin: -42px 0 0 -6px;
  position: absolute;
  width: 0;
}

.c-slider__ticks {
  --c-slider-tick-color: var(--c-tertiary-400);
  align-items: center;
  background: linear-gradient(
    to right,
    var(--_c-slider-background-color-active) calc(1% * var(--_c-slider-position)),
    var(--_c-slider-background-color) calc(1% * var(--_c-slider-position))
  );
  border-radius: 100vw;
  display: flex;
  height: 8px;
  justify-content: space-between;
  margin: -8px auto 0;
  pointer-events: none;
  position: relative;
  width: calc(100% - 16px);
  z-index: -1;
}

.c-slider__ticks--disabled {
  --_c-slider-background-color-active: var(--_c-slider-background-color-active-disabled);
}

.c-slider__ticks span {
  border-radius: 50%;
  font-size: 12px;
  height: 4px;
  padding: 0;
  position: relative;
  width: 4px;
}

.c-slider__ticks span.ticks {
  background-color: var(--_c-slider-tick-color);
}

.c-slider__ticks span.ticks.active {
  background-color: var(--_c-slider-tick-color-active);
}

.c-slider__ticks span.ticks:first-child,
.c-slider__ticks span.ticks:last-child {
  background-color: transparent;
}

.c-slider__ticks span.labels::after {
  content: attr(data-value);
  left: 2px;
  position: absolute;
  top: 16px;
  transform: translate(-50%);
}
</style>
