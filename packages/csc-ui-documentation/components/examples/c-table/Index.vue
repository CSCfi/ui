<template>
  <basic />

  <responsive />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Responsive from './Responsive.vue';

defineOptions({
  inheritAttrs: false,
});
</script>
