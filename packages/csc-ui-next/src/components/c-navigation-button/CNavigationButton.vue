<template>
  <c-icon-button text>
    <c-icon :path="menuIcon" />
  </c-icon-button>
</template>

<script setup lang="ts">
import { mdiMenu } from '@mdi/js';
import { onMounted, useHost } from 'vue';

const menuIcon = mdiMenu;
const host = useHost();

onMounted(() => host?.setAttribute('tabindex', '0'));
</script>

<style>
:host {
  --_c-navigation-button-color: var(
    --c-navigation-button-color,
    var(--c-text-system)
  );

  display: block;
  margin-right: 0;
  cursor: pointer;
  user-select: none;
  border-radius: 50%;

  --c-icon-button-text-text-color: var(--_c-navigation-button-color);
}
</style>
