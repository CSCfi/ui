<template>
  <div>
    <div>
      <p class="text-primary-600 text-lg font-medium m-0">
        {{ componentData?.tag }}
      </p>

      <component :is="table" :items="items" />
    </div>

    <div v-for="child in childItems" :key="child.tag">
      <p class="text-primary-600 text-lg font-medium mt-6">{{ child.tag }}</p>

      <component :is="table" :items="child.items" :tag="child.tag" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ErrorComponent from './ErrorComponent.vue';
import { ComponentData } from '~/types/docs';

const props = defineProps<{ component: string }>();

const { componentData } = storeToRefs(useExampleStore());

const tableName = computed(
  () => props.component?.charAt(0).toUpperCase() + props.component?.slice(1),
);

const table = computed(() =>
  props.component
    ? defineAsyncComponent({
        loader: () => import(`./tables/Table${tableName.value}.vue`),
        errorComponent: ErrorComponent,
      })
    : null,
);

const items = computed(
  () => componentData.value?.[props.component as keyof ComponentData] || [],
);

const childItems = computed(
  () =>
    componentData.value?.children
      ?.map((child) => ({
        tag: child.tag,
        items: child[props.component as keyof ComponentData],
      }))
      .filter((child) => !!child.items?.length) || [],
);
</script>

<style lang="scss"></style>
