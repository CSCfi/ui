<template>
  <basic />

  <delayed />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Delayed from './Delayed.vue';

defineOptions({
  inheritAttrs: false,
});
</script>
