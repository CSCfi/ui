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

    <!-- The components in their groups, as the overview page sections them
         (content/component-groups.ts keeps every standalone component in
         exactly one). -->
    <template v-for="group in COMPONENT_GROUPS" :key="group.id">
      <c-side-navigation-title>{{ group.title }}</c-side-navigation-title>

      <c-side-navigation-item
        v-for="tag in group.tags"
        :key="tag"
        :current.prop="route.path === `/components/${tag}`"
        :value="`/components/${tag}`"
      >
        {{ tag }}
      </c-side-navigation-item>
    </template>
  </c-side-navigation>
</template>

<script setup lang="ts">
import { COMPONENT_GROUPS } from '~/content/component-groups';

defineProps<{
  /** The slide-in drawer instead of the pinned desktop column. */
  mobile: boolean;
}>();

const route = useRoute();
</script>
