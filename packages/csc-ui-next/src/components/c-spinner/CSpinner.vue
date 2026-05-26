<template>
  <svg :width="size" :height="size">
    <circle :cx="size / 2" :cy="size / 2" :r="size / 2 - 2" />
  </svg>
</template>

<script setup lang="ts">
import { onMounted, useHost, watchEffect } from 'vue';

const props = defineProps({
  color: { type: String, default: 'var(--c-primary-600)' },
  size: { type: Number, default: 24 },
  width: { type: Number, default: 2 },
});

// The `:host` style block reads `--c-color`, `--c-size`, `--c-width`
// from the host. CSS-variable resolution happens on the element where
// they are *set*, so writing them on an inner <svg> (via :style) would
// not satisfy the `:host` selector. Apply them directly to the host
// element via JS so the cascade works.
const host = useHost();
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    host.style.setProperty('--c-size', `${props.size}px`);
    host.style.setProperty('--c-width', `${props.width}px`);
    host.style.setProperty('--c-color', props.color);
  });
});
</script>

<style>
:host {
  --_c-spinner-color: var(--c-spinner-color, var(--c-color));
  --_c-spinner-size: var(--c-size);
  --_c-spinner-width: var(--c-width);

  display: block;
  height: var(--_c-spinner-size);
  width: var(--_c-spinner-size);
}

svg {
  fill: var(--_c-spinner-color);
  height: var(--_c-spinner-size);
  overflow: visible;
  width: var(--_c-spinner-size);
}

circle {
  animation: c-spinner 2.5s linear infinite;
  fill: transparent;
  stroke-dasharray: calc(3.14 * var(--_c-spinner-size));
  stroke-linecap: round;
  stroke-width: var(--_c-spinner-width);
  stroke: var(--_c-spinner-color);
  transform-origin: calc(0.5px * var(--_c-spinner-size))
    calc(0.5px * var(--_c-spinner-size)) 0;
}

@keyframes c-spinner {
  0% {
    transform: rotate(0deg);
    stroke-dashoffset: calc(0.66 * var(--_c-spinner-size));
  }

  50% {
    transform: rotate(720deg);
    stroke-dashoffset: calc(3.14 * var(--_c-spinner-size));
  }

  100% {
    transform: rotate(1080deg);
    stroke-dashoffset: calc(0.66 * var(--_c-spinner-size));
  }
}
</style>
