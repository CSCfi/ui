<template>
  <div>
    <c-time-picker
      v-model="time"
      hint="Type a time or open the clock"
      label="Start time"
      clearable
    />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<string | null>(null);
</script>
