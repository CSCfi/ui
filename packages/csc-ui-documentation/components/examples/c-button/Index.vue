<template>
  <variants />

  <loading />

  <disabled />

  <icon />
</template>

<script setup lang="ts">
import Variants from './Variants.vue';
import Loading from './Loading.vue';
import Disabled from './Disabled.vue';
import Icon from './Icon.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
