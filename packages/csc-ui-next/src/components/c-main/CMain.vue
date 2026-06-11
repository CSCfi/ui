<template>
  <main :class="{ dashboard: !disableLayout }">
    <slot />
    <c-backdrop />
  </main>
</template>

<script setup lang="ts">
defineProps({
  disableLayout: { type: Boolean, default: false },
});
</script>

<style>
:host {
  --_c-main-background-color: var(--c-main-background-color, var(--c-primary-200));
  --_c-main-text-color: var(--c-main-text-color, var(--c-text-body));

  background: var(--_c-main-background-color);
  color: var(--_c-main-text-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

::slotted(*) {
  color: var(--_c-main-text-color);
}

main.dashboard {
  display: grid;
  grid-template: 'toolbar toolbar' auto 'sidenav page' 1fr / auto 1fr;
  gap: 0;
}

main.dashboard ::slotted(c-toolbar) { grid-area: toolbar; }
main.dashboard ::slotted(c-page) { grid-area: page; }
main.dashboard ::slotted(c-side-navigation) { grid-area: sidenav; }
</style>
