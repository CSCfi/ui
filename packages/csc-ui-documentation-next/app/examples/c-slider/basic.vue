<template>
  <div>
    <c-slider v-model="volume" label="Volume" />

    <span>Value: {{ volume }} %</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const volume = ref(40);
</script>
