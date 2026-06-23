<template>
  <div
    v-if="scrollIndicator"
    ref="scrollEl"
    class="c-page__scroll-indicator"
  />
  <div class="c-page__container">
    <slot />
  </div>
  <slot name="footer" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useHost, useTemplateRef } from 'vue';

// Multi-root template (fragment) — keep consumer fallthrough attrs
// (class/style) on the host element instead of tripping the "renders
// fragment" warning.
defineOptions({ inheritAttrs: false });

const props = defineProps({
  scrollIndicator: { type: Boolean, default: false },
});

const host = useHost();
const scrollEl = useTemplateRef<HTMLElement>('scrollEl');

// Replicates Stencil's onscroll handler: paints a 4px progress bar at
// the top of the viewport whose width tracks how far down the page is
// scrolled. The host element is the scrollable container itself
// (overflow-y: auto in :host).
const onScroll = () => {
  if (!props.scrollIndicator || !host || !scrollEl.value) return;
  const scrolled =
    (host.scrollTop / (host.scrollHeight - host.clientHeight)) * 100;
  scrollEl.value.style.width = `${scrolled}%`;
};

onMounted(() => {
  host?.addEventListener('scroll', onScroll);
});
onBeforeUnmount(() => {
  host?.removeEventListener('scroll', onScroll);
});
</script>

<style>
:host {
  --_c-page-max-width: var(--c-page-max-width, 1280px);
  --_c-page-justify-content: var(--c-page-justify-content, start);

  display: grid;
  height: calc(100lvh - 60px);
  grid-template-rows: 1fr auto;
  grid-template-columns: 1fr;
  width: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  position: relative;
  place-items: start var(--_c-page-justify-content);
}

.c-page__scroll-indicator {
  z-index: 9;
  height: 4px;
  background-color: var(--c-primary-600);
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
}

.c-page__container {
  padding: 0.5rem;
  position: relative;
  width: 100%;
  height: 100%;
  max-width: var(--_c-page-max-width);
}

@media (min-width: 640px) {
  .c-page__container { padding: 0.75rem; }
}

@media (min-width: 768px) {
  .c-page__container { padding: 1rem; }
}
</style>
