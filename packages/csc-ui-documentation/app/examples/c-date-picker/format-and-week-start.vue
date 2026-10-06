<template>
  <div>
    <c-date-picker
      v-model="date"
      :first-day-of-week="0"
      format="M/d/yyyy"
      label="Due date"
      show-week-numbers
    />

    <p>Value: {{ date ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const date = ref<null | string>('2026-09-28');
</script>
