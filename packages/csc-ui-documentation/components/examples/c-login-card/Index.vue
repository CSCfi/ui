<template>
  <basic />

  <colored />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Colored from './Colored.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
