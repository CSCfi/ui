<template>
  <basic />

  <mandatory />

  <multiple />

  <outlined />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Mandatory from './Mandatory.vue';
import Multiple from './Multiple.vue';
import Outlined from './Outlined.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
