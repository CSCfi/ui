<template>
  <basic />

  <custom-width />

  <dismissable />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import CustomWidth from './CustomWidth.vue';
import Dismissable from './Dismissable.vue';

usePageTitles();
</script>
