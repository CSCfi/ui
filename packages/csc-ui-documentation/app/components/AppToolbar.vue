<template>
  <!-- The bar must fit a 360px phone (plan: fullscreen-panel-and-mobile-docs,
       part B): below `sm` only the logo, the three switchers and the burger
       remain; the wordmark and badge return at `sm`, the switchers' labels
       at `md` (ToolbarMenu). `min-w-0` + `truncate` keep the wordmark on
       one line and the control cluster never shrinks off the right edge. -->
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
      class="ml-[0.35rem] shrink-0 rounded-full bg-accent px-2 py-[0.1rem] align-middle text-xs font-semibold tracking-wider text-on-accent max-sm:hidden"
    >
      v{{ corePackage.version }}
    </span>

    <div class="ml-auto flex shrink-0 items-center gap-2">
      <flavor-switcher />

      <theme-toggle />

      <color-switcher />

      <c-navigation-button v-if="navigationButton" />
    </div>
  </c-toolbar>
</template>

<script setup lang="ts">
// The badge names the release these docs were built from: the core package's
// version, which only the Version packages PR changes.
import corePackage from '../../../csc-ui/package.json';

defineProps<{
  /** Show the burger that opens the side navigation's drawer. */
  navigationButton: boolean;
}>();
</script>
