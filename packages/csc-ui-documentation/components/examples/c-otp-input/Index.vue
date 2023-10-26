<template>
  <automatic />

  <manual />
</template>

<script setup lang="ts">
import Automatic from './Automatic.vue';
import Manual from './Manual.vue';

defineOptions({
  inheritAttrs: false,
});
</script>
