<template>
  <div>
    <c-breadcrumb>
      <c-breadcrumb-item
        v-for="page in crumbs"
        :key="page.path"
        :href="page.path"
        @click.exact.prevent="navigate(page.path)"
      >
        {{ page.name }}
      </c-breadcrumb-item>
    </c-breadcrumb>

    <p>Route: {{ route }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Project #1', path: '/projects/1' },
  { name: 'Members', path: '/projects/1/members' },
];

// Stands in for the router's current route.
const route = ref('/projects/1/members');

const crumbs = computed(() =>
  PAGES.slice(0, PAGES.findIndex((page) => page.path === route.value) + 1),
);

const navigate = (path: string) => {
  // In an app: router.push(path)
  route.value = path;
};
</script>
