<template>
  <basic />

  <string />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import String from './String.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
