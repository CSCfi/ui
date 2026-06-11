<template>
  <slot />
</template>

<script setup lang="ts">
import { onMounted, useHost, watchEffect } from 'vue';

const props = defineProps({
  gap: { type: Number, default: 0 },
  nowrap: { type: Boolean, default: false },
  align: { type: String, default: '' },
  justify: { type: String, default: '' },
});

// `--_c-row-gap` is read from the host's inline style by every gap rule.
// Stencil sets it once in componentDidLoad; mirror that with watchEffect
// so dynamic prop changes still update the gap.
const host = useHost();
onMounted(() => {
  if (!host) return;
  watchEffect(() => {
    host.style.setProperty('--_c-row-gap', `${props.gap}px`);
  });
});
</script>

<style>
:host {
  --_c-row-gap: 0px;

  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: var(--_c-row-gap);
}

:host([nowrap]) {
  flex-wrap: nowrap !important;
}

:host([align='center']) { align-items: center; }
:host([align='start']) { align-items: flex-start; }
:host([align='end']) { align-items: flex-end; }

:host([justify='start']) { justify-content: flex-start; }
:host([justify='center']) { justify-content: center; }
:host([justify='end']) { justify-content: flex-end; }
:host([justify='space-between']) { justify-content: space-between; }
:host([justify='space-around']) { justify-content: space-around; }
</style>
