<template>
  <div>
    <c-date-picker
      v-model="date"
      hint="Today under the calendar sets the field back to today"
      label="Due date"
      show-today
    />

    <p>Value: {{ date ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const date = ref<null | string>('2025-03-14');
</script>
