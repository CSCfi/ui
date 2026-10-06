<template>
  <div>
    <c-time-picker v-model="time" format="h:mm a" label="Meeting time" />

    <p>Value: {{ time ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const time = ref<null | string>('14:30');
</script>
