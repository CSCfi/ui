<template>
  <basic />

  <customized />

  <volume />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Customized from './Customized.vue';
import Volume from './Volume.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
