<template>
  <basic />

  <complex />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Complex from './Complex.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
