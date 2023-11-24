<template>
  <component-example rows name="customized">
    <template #title>Custom max value and tooltip unit</template>

    <c-slider
      v-model="sliderValue"
      v-control
      label="Monthly cost"
      class="flex-1"
      max="1000"
      unit="€"
      ticks
      labels
    />
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sliderValue = ref(350);
</script>
