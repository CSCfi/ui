<template>
  <return-value />

  <basic />

  <options />

  <custom-filter />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import CustomFilter from './CustomFilter.vue';
import Options from './Options.vue';
import ReturnValue from './ReturnValue.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>

<style lang="scss"></style>
