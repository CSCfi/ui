<template>
  <c-main ref="pageElement" class="h-100vh">
    <c-toolbar>
      <c-csc-logo />

      CSC Design System

      <c-spacer />

      <c-tag active flat>v{{ version }}</c-tag>

      <c-navigation-button v-if="isMobile" />
    </c-toolbar>

    <div class="flex h-[calc(100vh-60px)]">
      <c-side-navigation :mobile="isMobile">
        <c-side-navigation-item
          @keyup.enter="navigateTo('/')"
          @click="navigateTo('/')"
        >
          <c-icon :path="mdiInformationOutline" size="16"></c-icon>
          About
        </c-side-navigation-item>

        <c-side-navigation-title>Components</c-side-navigation-title>

        <c-text-field
          v-model="query"
          v-control
          class="mr-6"
          placeholder="Search for a component"
          hide-details
          shadow
          @input="filterComponents()"
        >
          <c-icon slot="pre" :path="mdiMagnify" size="16"></c-icon>
        </c-text-field>

        <c-side-navigation-item
          v-for="group in navItems"
          :key="group.name"
          :active="group.visible"
        >
          {{ group.name }}

          <c-sub-navigation-item
            v-for="item in group.components"
            slot="subnavitem"
            :key="item.name"
            :active="route?.params?.slug?.[0] === item?.tag"
            class="capitalize"
            @keyup.enter="onNavigateToComponent(item.tag)"
            @click="onNavigateToComponent(item.tag)"
          >
            {{ item.name }}
          </c-sub-navigation-item>
        </c-side-navigation-item>
      </c-side-navigation>

      <div class="flex-1 h-full p-2 sm:p-3 md:p-4 lg:p-6 overflow-y-auto">
        <slot />
      </div>
    </div>
  </c-main>
</template>

<script lang="ts" setup>
import { mdiInformationOutline, mdiMagnify } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { ComponentData } from '../types/docs';
import packageJson from '../package.json';

const version = ref(packageJson.version);

interface ComponentGroup {
  name: string;
  components: ComponentData[];
  visible: boolean;
}

const navItems = ref<ComponentGroup[]>([]);

const query = ref('');

const route = useRoute();

const { currentComponent, parsedData } = storeToRefs(useExampleStore());

const pageElement = ref<HTMLCMainElement | null>(null);

const width = ref(0);

const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    const cr = entry.contentRect;
    width.value = cr.width;
  });
});

onMounted(() => {
  observer.observe(pageElement.value as HTMLCMainElement);
});

const isMobile = computed(() => width.value < 1280);

const getGroupedComponents = (
  query = '',
  visible = false,
): ComponentGroup[] => {
  return parsedData.value
    .filter((component: any) => {
      if (!query) return component;

      return component.tag.includes(query);
    })
    .reduce((groups: ComponentGroup[], component: any) => {
      const groupName = (
        component.docsTags.find((docsTag: any) => docsTag.name === 'group')
          ?.text || 'ungrouped'
      ).toLowerCase();
      const group = groups.find((group) => group.name === groupName);

      if (!group) {
        groups.push({
          name: groupName,
          components: [component],
          visible: false,
        });

        return groups;
      }

      group.components.push(component);

      return groups;
    }, [] as ComponentGroup[])
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
    .map((group: ComponentGroup) => {
      if (!route.path.includes('components')) return group;

      const isActive = group.components.some(
        (component: any) => component.tag === route.params.slug[0],
      );

      return { ...group, visible: isActive || visible };
    });
};

const filterComponents = () => {
  navItems.value = getGroupedComponents(query.value, !!query.value);
};

watch(
  parsedData.value,
  (data) => {
    if (!data) return;

    navItems.value = getGroupedComponents();
  },
  { immediate: true },
);

watch(
  () => route,
  (currentRoute) => {
    if (!currentRoute.path.includes('components')) return;

    const [component] = currentRoute.params.slug;

    currentComponent.value = component;
  },
  { immediate: true },
);

const onNavigateToComponent = async (name: string) => {
  currentComponent.value = name;

  await navigateTo(`/components/${name}`);
};
</script>
