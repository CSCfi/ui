<template>
  <basic />

  <flat />

  <badge />

  <closeable />

  <fit />

  <block />

  <small-variant />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Flat from './Flat.vue';
import Closeable from './Closeable.vue';
import Fit from './Fit.vue';
import Block from './Block.vue';
import SmallVariant from './Small.vue';
import Badge from './Badge.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
