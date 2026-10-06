<template>
  <div>
    <c-time-picker
      v-model="time"
      :minute-step="15"
      hint="Slots every 15 minutes; any typed time is kept"
      label="Appointment"
    />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<null | string>(null);
</script>
