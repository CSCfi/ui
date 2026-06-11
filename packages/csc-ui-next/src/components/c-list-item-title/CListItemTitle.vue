<template>
  <slot />
</template>

<script setup lang="ts">
defineProps({
  active: { type: Boolean, default: false },
});
</script>

<style>
:host {
  --_c-list-item-title-color: var(--c-list-item-title-color, var(--c-text-body));
  --_c-list-item-title-color-active: var(
    --c-list-item-title-color-active,
    var(--c-primary-600)
  );

  display: block;
  font-weight: 500;
  color: var(--_c-list-item-title-color);
}

:host([active]) {
  color: var(--_c-list-item-title-color-active);
}
</style>
