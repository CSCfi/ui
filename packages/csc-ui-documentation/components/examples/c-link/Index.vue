<template>
  <basic />

  <variants />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Variants from './Variants.vue';

defineOptions({
  inheritAttrs: false,
});
</script>
