<template>
  <return-value />

  <basic />

  <options />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Options from './Options.vue';
import ReturnValue from './ReturnValue.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>

<style lang="scss"></style>
