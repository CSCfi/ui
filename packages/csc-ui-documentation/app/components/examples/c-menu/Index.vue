<template>
  <!-- The `next` c-menu is a declarative, slot-based command menu (a deliberate
       API break from the Stencil `:items` array), so the examples differ per
       implementation backend. -->
  <template v-if="isNext">
    <next-basic />

    <next-submenu />

    <next-disabled />

    <next-controlled />
  </template>

  <basic v-else />
</template>

<script setup lang="ts">
import Basic from './Basic.vue';
import NextBasic from './NextBasic.vue';
import NextControlled from './NextControlled.vue';
import NextDisabled from './NextDisabled.vue';
import NextSubmenu from './NextSubmenu.vue';

defineOptions({
  inheritAttrs: false,
});

const isNext = useRuntimeConfig().public.cscUiImpl === 'next';

usePageTitles();
</script>
