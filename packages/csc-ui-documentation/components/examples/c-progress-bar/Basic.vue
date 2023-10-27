<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-progress-bar value="50" />

    <c-progress-bar :value="progress" />
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const progress = ref(25);

const interval = setInterval(() => {
  progress.value = Math.ceil(Math.random() * 100);
}, 2000);

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>
