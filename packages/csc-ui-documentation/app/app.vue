<template>
  <div class="flex min-h-screen flex-col">
    <!-- The bar must fit a 360px phone (plan: fullscreen-panel-and-mobile-docs,
         part B): below `sm` only the logo, the two icon-only switchers and
         the burger remain; the wordmark and badge return at `sm`, the flavor
         switcher at `md`. `min-w-0` + `truncate` keep the wordmark on one
         line and the control cluster never shrinks off the right edge. -->
    <c-toolbar>
      <nuxt-link
        aria-label="CSC Design System home"
        class="flex shrink-0 items-center text-lg font-bold no-underline"
        to="/"
      >
        <c-csc-logo aria-hidden="true" />
      </nuxt-link>

      <span class="min-w-0 truncate max-sm:hidden">CSC Design System</span>

      <span
        class="ml-[0.35rem] shrink-0 rounded-full bg-accent px-2 py-[0.1rem] align-middle text-xs font-semibold tracking-wider text-on-accent uppercase max-sm:hidden"
      >
        v{{ major }}
      </span>

      <div class="ml-auto flex shrink-0 items-center gap-2">
        <flavor-switcher class="max-md:hidden" />

        <theme-toggle />

        <color-switcher />

        <c-navigation-button v-if="isMobile" />
      </div>
    </c-toolbar>

    <div class="flex min-h-0 flex-1">
      <!-- Design-system side navigation (dogfooded). `autoheight` is the
           component's own host state (viewport minus the 60px toolbar, inner
           scroll); `sticky top-15` pins it below the fixed toolbar while
           the page scrolls. Both are inert on mobile, where the un-classed
           host is display:contents and the drawer inside is fixed. Items use
           `.prop`/@select (not href) so navigation stays client-side: each
           item's value is its route. -->
      <c-side-navigation
        :mobile.prop="isMobile"
        class="autoheight sticky top-15"
        @select="navigateTo($event.detail.value)"
      >
        <c-side-navigation-title>Guides</c-side-navigation-title>

        <c-side-navigation-item
          :active.prop="route.path === '/getting-started'"
          value="/getting-started"
        >
          Getting started
        </c-side-navigation-item>

        <c-side-navigation-item
          :active.prop="route.path === '/customization'"
          value="/customization"
        >
          Customization
        </c-side-navigation-item>

        <c-side-navigation-item
          :active.prop="route.path === '/data-visualization'"
          value="/data-visualization"
        >
          Data visualization
        </c-side-navigation-item>

        <c-side-navigation-item
          :active.prop="route.path === '/migration'"
          value="/migration"
        >
          Migration guide
        </c-side-navigation-item>

        <c-side-navigation-title>Components</c-side-navigation-title>

        <c-side-navigation-item
          v-for="component in navComponents"
          :key="component.tagName"
          :active.prop="route.path === `/components/${component.tagName}`"
          :value="`/components/${component.tagName}`"
        >
          {{ component.tagName }}
        </c-side-navigation-item>
      </c-side-navigation>

      <main
        class="max-w-420 min-w-0 flex-1 px-5 pt-6 pb-12 md:px-12 md:pt-8 md:pb-16"
      >
        <nuxt-page />

        <!-- Plain links: /v3/ is a static archive the client router does not
             know, so it must load as a page of its own. -->
        <footer
          class="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-on-surface-muted"
        >
          <a class="underline" href="/v3/">
            3.x documentation (archived, unsupported)
          </a>

          <a class="underline" href="https://github.com/CSCfi/ui">
            Source on GitHub
          </a>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import corePackage from '../../csc-ui/package.json';

// A stable gutter keeps the page from reflowing when the library's page lock
// (an open c-select list, a c-modal) hides the document scrollbar (ADR-0014).
useHead({
  htmlAttrs: {
    class: 'scroll-smooth [scrollbar-gutter:stable]',
  },
});

const { navComponents } = useManifest();

// The badge names the major these docs cover; `/v3/` archives the last one.
const major = corePackage.version.split('.')[0];

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
