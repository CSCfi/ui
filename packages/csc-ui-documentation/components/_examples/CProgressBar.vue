<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-progress-bar value="50"></c-progress-bar>
    <c-progress-bar :value="progress"></c-progress-bar>
  </component-example>

  <component-example name="indeterminate" rows>
    <template #title>Indeterminate state</template>

    <c-progress-bar indeterminate></c-progress-bar>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { ref } from 'vue';

const progress = ref(25);

const interval = setInterval(() => {
  progress.value = Math.ceil(Math.random() * 100);
}, 2000);

onBeforeUnmount(() => {
  clearInterval(interval);
});
// @example-end
</script>

<style lang="scss"></style>
