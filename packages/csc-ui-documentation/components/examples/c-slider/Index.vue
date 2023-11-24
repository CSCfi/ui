<template>
  <basic />

  <volume />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Volume from './Volume.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
