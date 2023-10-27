<template>
  <basic />

  <simple />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Simple from './Simple.vue';

defineOptions({
  inheritAttrs: false,
});
</script>
