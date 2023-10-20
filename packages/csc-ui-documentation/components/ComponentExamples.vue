<template>
  <c-card ref="cardRef" class="max-w-screen-xl mx-auto">
    <c-card-content>
      <div class="example-headings">
        <h1 class="text-4xl capitalize font-bold text-primary-600">
          {{ componentData?.name }}
        </h1>

        <h2 class="text-xl text-tertiary-500">{{ component }}</h2>
      </div>

      <p v-if="!!componentData?.docs">{{ componentData.docs }}</p>

      <c-tabs v-model="activeTab" v-control :vertical="isMobile">
        <c-tab
          v-for="tab in tabs"
          :key="tab.value"
          :disabled="!tab.enabled"
          :value="tab.value"
          @click="onTabClick(tab)"
        >
          {{ tab.label }}
        </c-tab>

        <c-tab-items slot="items">
          <c-tab-item
            v-for="tab in tabs"
            :key="`item-${tab.label.toLowerCase()}`"
            :value="tab.value"
          >
            <div v-if="tab.enabled" class="flex flex-col gap-6">
              <keep-alive>
                <component :is="tab.component" :component="tab.query.tab" />
              </keep-alive>
            </div>
          </c-tab-item>
        </c-tab-items>
      </c-tabs>
    </c-card-content>
  </c-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import ErrorComponent from './ErrorComponent.vue';
import DocumentationTable from './DocumentationTable.vue';

const props = defineProps<{
  component: string;
}>();

const cardRef = ref<HTMLCCardElement | null>(null);

const isMobile = ref(false);

const route = useRoute();

const { componentData } = storeToRefs(useExampleStore());

const onTabClick = async (tab: any) => {
  await navigateTo({ ...route, query: tab.query });
};

provide('componentName', props.component);

const tabs = computed(() => {
  return [
    {
      label: 'Examples',
      value: 'examples',
      enabled: true,
      query: {},
      component: props.component
        ? defineAsyncComponent({
            loader: () => import(`./examples/${props.component}/Index.vue`),
            errorComponent: ErrorComponent,
          })
        : null,
    },
    {
      label: 'Attributes',
      value: 'props',
      enabled:
        !!componentData.value?.props?.length ||
        !!componentData.value?.children?.some((child) => child.props?.length),
      query: {
        tab: 'props',
      },
      component: DocumentationTable,
    },
    {
      label: 'Methods',
      value: 'methods',
      enabled:
        !!componentData.value?.methods?.length ||
        !!componentData.value?.children?.some((child) => child.methods?.length),
      query: {
        tab: 'methods',
      },
      component: DocumentationTable,
    },
    {
      label: 'Slots',
      value: 'slots',
      enabled:
        !!componentData.value?.slots?.length ||
        !!componentData.value?.children?.some((child) => child.slots?.length),
      query: {
        tab: 'slots',
      },
      component: DocumentationTable,
    },
    {
      label: 'Events',
      value: 'events',
      enabled:
        !!componentData.value?.events?.length ||
        !!componentData.value?.children?.some((child) => child.events?.length),
      query: {
        tab: 'events',
      },
      component: DocumentationTable,
    },
    {
      label: 'Styles',
      value: 'styles',
      enabled:
        !!componentData.value?.styles?.length ||
        !!componentData.value?.children?.some((child) => child.styles?.length),
      query: {
        tab: 'styles',
      },
      component: DocumentationTable,
    },
    // {
    //   label: 'Types',
    //   value: 'types',
    //   enabled: !!types.value.get(route.params.slug[0]),
    //   query: {
    //     tab: 'types',
    //   },
    //   component: DocumentationTable,
    // },
  ];
});

const activeTab = ref(route.query.tab || tabs.value[0].value);

onMounted(() => {
  // useResizeObserver(cardRef, ([entry]) => {
  //   const { width } = entry.contentRect;
  //   isMobile.value = width <= 440;
  // });
});
</script>

<style lang="scss">
.component-example {
  + .component-example {
    margin-top: 24px;
  }
}
</style>
