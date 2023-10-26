<template>
  <basic />

  <return-value />

  <options />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Options from './Options.vue';
import ReturnValue from './ReturnValue.vue';

defineOptions({
  inheritAttrs: false,
});
</script>

<style lang="scss"></style>
