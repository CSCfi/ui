<template>
  <div>
    <p class="text-primary-600 text-lg font-medium m-0">
      {{ componentData?.tag }}
    </p>

    <component :is="table" :items="items" />
  </div>

  <div v-for="child in childItems" :key="child.tag">
    <p class="text-primary-600 text-lg font-medium m-0">{{ child.tag }}</p>

    <component :is="table" :items="child.items" :tag="child.tag" />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ErrorComponent from './ErrorComponent.vue';
import { ComponentData } from '~/types/docs';

const { componentData } = storeToRefs(useExampleStore());

const route = useRoute();

const tableName = computed(
  () =>
    ((route.query.tab as string) || '')?.charAt(0).toUpperCase() +
    route.query.tab?.slice(1),
);

const table = computed(() =>
  route.query.tab
    ? defineAsyncComponent({
        loader: () => import(`./tables/Table${tableName.value}.vue`),
        errorComponent: ErrorComponent,
      })
    : null,
);

const items = computed(
  () => componentData.value?.[route.query.tab as keyof ComponentData] || [],
);

const childItems = computed(
  () =>
    componentData.value?.children
      ?.map((child) => ({
        tag: child.tag,
        items: child[route.query.tab as keyof ComponentData],
      }))
      .filter((child) => !!child.items?.length) || [],
);
</script>

<style lang="scss"></style>
