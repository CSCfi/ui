<template>
  <c-card class="max-w-screen-xl mx-auto">
    <!-- <c-card-title>{{ component }}</c-card-title> -->

    <c-card-content>
      <div class="grid gap-1">
        <h1 class="text-4xl capitalize font-bold text-primary-600">
          {{ componentData?.name }}
        </h1>

        <h2 class="text-2xl text-tertiary-500">{{ component }}</h2>
      </div>

      <div>
        <c-tabs v-model="activeTab" v-control>
          <c-tab
            v-for="tab in tabs"
            :key="tab.label"
            :disabled="!tab.enabled"
            :value="tab.label"
            @click="onTabClick(tab)"
          >
            {{ tab.label }}
          </c-tab>
        </c-tabs>
      </div>

      <!-- <transition name="fade" mode="out-in"> -->
      <keep-alive>
        <component :is="example" v-if="activeTab === 'Examples'" />

        <documentation-table
          v-else
          :key="(route.query.tab as string) || 'default'"
        />
      </keep-alive>

      <!-- </transition> -->
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ErrorComponent from './ErrorComponent.vue';
import { ComponentData } from '~/types/docs';

const props = defineProps<{
  component: string;
}>();

const route = useRoute();

const { componentData } = storeToRefs(useExampleStore());

const onTabClick = async (tab: any) => {
  await navigateTo({ ...route, query: tab.query });
};

const toPascalCase = (name: string) =>
  name
    .split('-')
    .map(
      (part) => part.charAt(0).toUpperCase() + part.substring(1).toLowerCase(),
    )
    .join('');

provide('componentName', toPascalCase(props.component));

const example = computed(() =>
  props.component
    ? defineAsyncComponent({
        loader: () => import(`./examples/${toPascalCase(props.component)}.vue`),
        errorComponent: ErrorComponent,
      })
    : null,
);

const activeTab = ref('Examples');

const isPrivate = (child: ComponentData) => {
  return child.docsTags.some((tag) => tag.name !== 'private');
};

const tabs = computed(() => {
  const isChildPrivate = componentData.value?.children.some(isPrivate);

  return [
    {
      label: 'Examples',
      enabled: true,
      query: {},
    },
    {
      label: 'Attributes',
      enabled:
        !!componentData.value?.props?.length ||
        (!!componentData.value?.children?.some(
          (child) => child.props?.length,
        ) &&
          !isChildPrivate),
      query: {
        tab: 'props',
      },
    },
    {
      label: 'Methods',
      enabled:
        !!componentData.value?.methods?.length ||
        (!!componentData.value?.children?.some(
          (child) => child.methods?.length,
        ) &&
          !isChildPrivate),
      query: {
        tab: 'methods',
      },
    },
    {
      label: 'Slots',
      enabled:
        !!componentData.value?.slots?.length ||
        (!!componentData.value?.children?.some(
          (child) => child.slots?.length,
        ) &&
          !isChildPrivate),
      query: {
        tab: 'slots',
      },
    },
    {
      label: 'Events',
      enabled:
        !!componentData.value?.events?.length ||
        (!!componentData.value?.children?.some(
          (child) => child.events?.length,
        ) &&
          !isChildPrivate),
      query: {
        tab: 'events',
      },
    },
    {
      label: 'Styles',
      enabled:
        !!componentData.value?.styles?.length ||
        !!componentData.value?.children?.some((child) => child.styles?.length),
      query: {
        tab: 'styles',
      },
    },
  ];
});
</script>

<style lang="scss">
.component-example {
  + .component-example {
    margin-top: 24px;
  }
}
</style>
