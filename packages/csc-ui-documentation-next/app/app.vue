<template>
  <div class="flex min-h-screen flex-col">
    <c-toolbar>
      <NuxtLink class="text-lg font-bold no-underline flex items-center" to="/">
        <c-csc-logo></c-csc-logo>
      </NuxtLink>

      CSC Design System

      <span
        class="ml-[0.35rem] rounded-full bg-accent px-2 py-[0.1rem] align-middle text-xs font-semibold uppercase tracking-wider text-on-accent"
      >
        next
      </span>

      <div class="flex gap-2 items-center flex-1 justify-end">
        <FlavorSwitcher class="max-md:hidden" />

        <ThemeToggle />

        <ColorSwitcher />

        <c-navigation-button v-if="isMobile" />
      </div>
    </c-toolbar>

    <div class="flex min-h-0 flex-1">
      <!-- Design-system side navigation (dogfooded). `autoheight` is the
           component's own host state (viewport minus the 60px toolbar, inner
           scroll); `sticky top-15` pins it below the fixed toolbar while
           the page scrolls. Both are inert on mobile, where the un-classed
           host is display:contents and the drawer inside is fixed. Items use
           `.prop`/@itemChange (not href) so navigation stays client-side. -->
      <c-side-navigation
        class="autoheight sticky top-15"
        :mobile.prop="isMobile"
      >
        <c-side-navigation-title>Guides</c-side-navigation-title>

        <c-side-navigation-item
          :active.prop="route.path === '/getting-started'"
          @itemChange="navigateTo('/getting-started')"
        >
          Getting started
        </c-side-navigation-item>

        <c-side-navigation-item
          :active.prop="route.path === '/migration'"
          @itemChange="navigateTo('/migration')"
        >
          Migration guide
        </c-side-navigation-item>

        <c-side-navigation-title>Components</c-side-navigation-title>

        <c-side-navigation-item
          v-for="component in navComponents"
          :key="component.tagName"
          :active.prop="route.path === `/components/${component.tagName}`"
          @itemChange="navigateTo(`/components/${component.tagName}`)"
        >
          {{ component.tagName }}
        </c-side-navigation-item>
      </c-side-navigation>

      <main
        class="min-w-0 max-w-280 flex-1 px-5 pb-12 pt-6 md:px-12 md:pb-16 md:pt-8"
      >
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'scroll-smooth'
  },
});
const { navComponents } = useManifest();

const route = useRoute();

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
