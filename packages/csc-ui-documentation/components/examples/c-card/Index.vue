<template>
  <basic />

  <fullscreen />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Fullscreen from './Fullscreen.vue';

defineOptions({
  inheritAttrs: false,
});
</script>
