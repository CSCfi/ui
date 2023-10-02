<template>
  <c-main ref="pageElement" class="h-100vh">
    <c-toolbar>
      <c-csc-logo />

      CSC Design System

      <c-spacer />

      <c-navigation-button v-if="isMobile" />
    </c-toolbar>

    <div class="flex h-[calc(100vh-60px)]">
      <c-side-navigation :mobile="isMobile">
        <c-side-navigation-item>
          <div slot="main" class="flex gap-3 items-center">
            <c-icon :path="mdiInformationOutline" size="16"></c-icon>
            About
          </div>
        </c-side-navigation-item>

        <c-side-navigation-title>Components</c-side-navigation-title>

        <c-side-navigation-item
          v-for="group in navItems"
          :key="group.name"
          :active="group.visible"
        >
          <div slot="main" class="capitalize">
            {{ group.name }}
          </div>

          <div slot="subnavitem">
            <c-sub-navigation-item
              v-for="item in group.components"
              :key="item.name"
              :active="route.params.slug[0] === item?.tag"
              class="capitalize"
              @click="onNavigation(item.tag)"
            >
              {{ item.name }}
            </c-sub-navigation-item>
          </div>
        </c-side-navigation-item>
      </c-side-navigation>

      <div class="flex-1 h-full p-2 sm:p-4 md:p-6 lg:p-12 overflow-y-auto">
        <slot />
      </div>
    </div>
  </c-main>
</template>

<script lang="ts" setup>
import { mdiInformationOutline } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { ComponentData } from '../types/docs';

interface ComponentGroup {
  name: string;
  components: ComponentData[];
  visible: boolean;
}

const navItems = ref<ComponentGroup[]>([]);

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
  items: any,
  query = null,
  visible = false,
): ComponentGroup[] => {
  return items
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
          visible: visible && !!query,
        });

        return groups;
      }

      group.components.push(component);

      return groups;
    }, [] as ComponentGroup[])
    .sort((a: any, b: any) => a.name.localeCompare(b.name))
    .map((group: ComponentGroup) => {
      const isActive = group.components.some(
        (component: any) => component.tag === route.params.slug[0],
      );

      return { ...group, visible: isActive };
    });
};

watch(
  parsedData.value,
  (data) => {
    if (!data) return;

    navItems.value = getGroupedComponents(data);
  },
  { immediate: true },
);

watch(
  () => route,
  (currentRoute) => {
    const [component] = currentRoute.params.slug;

    currentComponent.value = component;
  },
  { immediate: true },
);

const onNavigation = async (name: string) => {
  currentComponent.value = name;

  await navigateTo(`/${name}`);
};
</script>
