<template>
  <basic />

  <option-as-value />

  <object-items />

  <label-on-top />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import OptionAsValue from './OptionAsValue.vue';
import ObjectItems from './ObjectItems.vue';
import LabelOnTop from './LabelOnTop.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
