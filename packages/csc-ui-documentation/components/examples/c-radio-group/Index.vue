<template>
  <basic />

  <inline />

  <states />

  <radio-buttons />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Inline from './Inline.vue';
import States from './States.vue';
import RadioButtons from './RadioButtons.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
