<template>
  <svg viewBox="0 0 24 24">
    <path :d="path" />
  </svg>
</template>

<script setup lang="ts">
import { useHost, watchEffect } from 'vue';

const props = defineProps({
  /** Svg `path` `d` attribute value. */
  path: { type: String, required: true },
  /** Icon size in pixels. */
  size: { type: Number, default: 24 },
  /** Fill color. */
  color: { type: String, default: 'currentColor' },
});

const host = useHost();

watchEffect(() => {
  if (!host) return;
  host.style.setProperty('--_c-icon-default-color', props.color);
  host.style.setProperty('--_c-icon-default-size', `${props.size}px`);
});
</script>

<style>
:host {
  --_c-icon-color: var(--c-icon-color, var(--_c-icon-default-color, currentColor));
  --_c-icon-size: var(--c-icon-size, var(--_c-icon-default-size, 24px));

  display: inline-flex;
  align-items: center;
  height: var(--_c-icon-size);
  width: var(--_c-icon-size);
}

svg {
  height: var(--_c-icon-size);
  width: var(--_c-icon-size);
}

path {
  fill: var(--_c-icon-color);
}
</style>
