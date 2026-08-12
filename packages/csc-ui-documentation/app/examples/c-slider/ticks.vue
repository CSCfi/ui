<template>
  <div>
    <c-slider
      v-model="cores"
      label="CPU cores"
      labels
      max="8"
      min="0"
      segments="8"
      step="1"
      ticks
      unit=""
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const cores = ref(2);
</script>
