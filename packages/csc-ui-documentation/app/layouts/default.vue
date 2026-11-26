<template>
  <div class="flex min-h-screen flex-col">
    <app-toolbar :navigation-button="isMobile" />

    <div class="flex min-h-0 flex-1">
      <app-side-navigation :mobile="isMobile" />

      <main
        class="max-w-420 min-w-0 flex-1 px-5 pt-6 pb-12 md:px-12 md:pt-8 md:pb-16"
      >
        <slot />

        <app-footer class="mt-16" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Viewport breakpoint for the side-navigation drawer mode. Measured from the
// window (the c-* hosts are display:contents and generate no box to observe).
// Defaults to a desktop width so SSR/prerender emits the desktop layout;
// corrected on mount. 1024px keeps the ~300–340px desktop drawer from
// squeezing the content column on tablets.
const width = ref(1280);

const updateWidth = () => {
  width.value = window.innerWidth;
};

onMounted(() => {
  updateWidth();
  window.addEventListener('resize', updateWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth);
});

const isMobile = computed(() => width.value < 1024);
</script>
