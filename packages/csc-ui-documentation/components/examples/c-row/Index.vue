<template>
  <default />

  <justify-align />
</template>

<script setup lang="ts">
import Default from './Default.vue';
import JustifyAlign from './JustifyAlign.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
