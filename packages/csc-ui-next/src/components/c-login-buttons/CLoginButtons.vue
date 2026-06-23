<template>
  <slot />
</template>

<script setup lang="ts">
// `<slot />` root (fragment) — keep consumer fallthrough attrs (class/style)
// on the host element instead of tripping the "renders fragment" warning.
defineOptions({ inheritAttrs: false });
</script>

<style>
:host {
  display: grid;
  grid-gap: clamp(1rem, 2vw, 1.5rem);
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
}
</style>
