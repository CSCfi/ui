<template>
  <basic />

  <title-actions />

  <fullscreen />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Fullscreen from './Fullscreen.vue';
import TitleActions from './TitleActions.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
