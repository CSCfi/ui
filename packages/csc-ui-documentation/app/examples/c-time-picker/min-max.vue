<template>
  <div>
    <c-time-picker
      v-model="time"
      hint="Between 8.00 and 16.00"
      label="Pickup time"
      max="16:00"
      min="08:00"
    />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<string | null>(null);
</script>
