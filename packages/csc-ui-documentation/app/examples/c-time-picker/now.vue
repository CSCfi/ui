<template>
  <div>
    <c-time-picker
      v-model="time"
      hint="Now under the columns commits the current minute"
      label="Arrival"
      :minute-step="15"
      show-now
    />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<string | null>('08:00');
</script>
