<template>
  <basic />

  <form-usage />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import FormUsage from './Form.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
