<template>
  <!-- Design-system side navigation (dogfooded). `autoheight` is the
       component's own host state (viewport minus the 60px toolbar, inner
       scroll); `sticky top-15` pins it below the fixed toolbar while
       the page scrolls. Both are inert on mobile, where the un-classed
       host is display:contents and the drawer inside is fixed. Items use
       `.prop`/@select (not href) so navigation stays client-side: each
       item's value is its route. -->
  <c-side-navigation
    :mobile.prop
    class="autoheight sticky top-15"
    @select="navigateTo($event.detail.value)"
  >
    <c-side-navigation-title>Guides</c-side-navigation-title>

    <c-side-navigation-item
      :current.prop="route.path === '/getting-started'"
      value="/getting-started"
    >
      Getting started
    </c-side-navigation-item>

    <c-side-navigation-item
      :current.prop="route.path === '/customization'"
      value="/customization"
    >
      Customization
    </c-side-navigation-item>

    <c-side-navigation-item
      :current.prop="route.path === '/data-visualization'"
      value="/data-visualization"
    >
      Data visualization
    </c-side-navigation-item>

    <c-side-navigation-item
      :current.prop="route.path === '/migration'"
      value="/migration"
    >
      Migration guide
    </c-side-navigation-item>

    <c-side-navigation-title>Components</c-side-navigation-title>

    <!-- The title takes no link, so the component index is an item. -->
    <c-side-navigation-item
      :current.prop="route.path === '/components'"
      value="/components"
    >
      Overview
    </c-side-navigation-item>

    <c-side-navigation-item
      v-for="component in navComponents"
      :key="component.tagName"
      :current.prop="route.path === `/components/${component.tagName}`"
      :value="`/components/${component.tagName}`"
    >
      {{ component.tagName }}
    </c-side-navigation-item>
  </c-side-navigation>
</template>

<script setup lang="ts">
defineProps<{
  /** The slide-in drawer instead of the pinned desktop column. */
  mobile: boolean;
}>();

const route = useRoute();

const { navComponents } = useManifest();
</script>
