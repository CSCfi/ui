<template>
  <basic />

  <mobile />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Mobile from './Mobile.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
