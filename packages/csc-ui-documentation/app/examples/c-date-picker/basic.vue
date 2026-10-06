<template>
  <div>
    <c-date-picker
      v-model="date"
      hint="Type a date or open the calendar"
      label="Start date"
      clearable
    />

    <p>Value: {{ date ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const date = ref<null | string>(null);
</script>
