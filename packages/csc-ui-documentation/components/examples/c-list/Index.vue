<template>
  <basic />

  <titles />

  <slots />

  <disabled />

  <disabled-items />

  <actions />

  <active />

  <bordered />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import Titles from './Titles.vue';
import Slots from './Slots.vue';
import Disabled from './Disabled.vue';
import DisabledItems from './DisabledItems.vue';
import Actions from './Actions.vue';
import Active from './Active.vue';
import Bordered from './Bordered.vue';

defineOptions({
  inheritAttrs: false,
});

usePageTitles();
</script>
