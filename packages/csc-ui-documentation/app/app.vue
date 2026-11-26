<template>
  <!-- The docs pages use layouts/default.vue (toolbar, pinned side
       navigation); the landing page at `/` uses layouts/landing.vue. -->
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup lang="ts">
// A stable gutter keeps the page from reflowing when the library's page lock
// (an open c-select list, a c-modal) hides the document scrollbar (ADR-0014).
useHead({
  htmlAttrs: {
    class: 'scroll-smooth [scrollbar-gutter:stable]',
    lang: 'en',
  },
});
</script>
