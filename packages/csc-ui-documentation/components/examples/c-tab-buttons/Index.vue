<template>
  <basic />

  <mandatory />

  <disabled />

  <tabs />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Mandatory from './Mandatory.vue';
import Disabled from './Disabled.vue';
import Tabs from './Tabs.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
