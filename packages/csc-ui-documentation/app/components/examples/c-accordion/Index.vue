<template>
  <basic />

  <mandatory />

  <multiple />

  <outlined />

  <custom-header />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Mandatory from './Mandatory.vue';
import Multiple from './Multiple.vue';
import Outlined from './Outlined.vue';
import CustomHeader from './CustomHeader.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
