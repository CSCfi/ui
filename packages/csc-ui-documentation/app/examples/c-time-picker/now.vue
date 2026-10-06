<template>
  <div>
    <c-time-picker
      v-model="time"
      :minute-step="15"
      hint="Now under the columns commits the current minute"
      label="Arrival"
      show-now
    />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<null | string>('08:00');
</script>
