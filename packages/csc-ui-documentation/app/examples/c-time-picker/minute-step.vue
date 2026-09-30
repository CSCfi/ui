<template>
  <div>
    <c-time-picker
      v-model="time"
      hint="Slots every 15 minutes; any typed time is kept"
      label="Appointment"
      :minute-step="15"
    />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<string | null>(null);
</script>
