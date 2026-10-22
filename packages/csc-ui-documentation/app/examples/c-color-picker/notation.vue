<template>
  <div>
    <c-color-picker
      v-model="color"
      format="oklch"
      hint="The value is always written as oklch()"
      label="Brand colour"
    />

    <p>Value: {{ color ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const color = ref<null | string>('oklch(0.5686 0.202 259.7)');
</script>
