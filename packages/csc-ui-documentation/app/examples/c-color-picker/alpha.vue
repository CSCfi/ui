<template>
  <div>
    <c-color-picker
      v-model="color"
      format="rgb"
      hint="Drag the alpha slider for transparency"
      label="Overlay colour"
      alpha
    />

    <p>Value: {{ color ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const color = ref<null | string>('rgb(31 111 235 / 0.5)');
</script>
