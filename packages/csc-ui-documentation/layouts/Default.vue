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
      <c-side-navigation :mobile="isMobile" class="autoheight">
        <c-side-navigation-item
          :active="route?.name === 'index'"
          @keyup.enter="navigateTo('/')"
          @click="navigateTo('/')"
        >
          <c-icon :path="mdiInformationOutline" size="16"></c-icon>
          About
        </c-side-navigation-item>

        <c-side-navigation-item
          :active="route?.fullPath.startsWith('/getting-started')"
        >
          Getting Started

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.fullPath.includes('angular')"
            @keyup.enter="navigateTo('/getting-started/angular')"
            @click="navigateTo('/getting-started/angular')"
          >
            <c-icon :path="mdiAngular" size="16" />
            Angular
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            @keyup.enter="navigateTo('/getting-started/html')"
            @click="navigateTo('/getting-started/html')"
          >
            <c-icon :path="mdiLanguageHtml5" size="16" />
            Html page
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.fullPath.includes('vue3')"
            @keyup.enter="navigateTo('/getting-started/vue3')"
            @click="navigateTo('/getting-started/vue3')"
          >
            <c-icon :path="mdiVuejs" size="16" />
            Vue 3
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.fullPath.includes('vue2')"
            @keyup.enter="navigateTo('/getting-started/vue2')"
            @click="navigateTo('/getting-started/vue2')"
          >
            <c-icon :path="mdiVuejs" size="16" />
            Vue 2
          </c-sub-navigation-item>
        </c-side-navigation-item>

        <c-side-navigation-item>
          Templates
          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.fullPath.includes('basic-template')"
            @keyup.enter="navigateTo('/basic-template')"
            @click="navigateTo('/basic-template')"
          >
            Basic template
          </c-sub-navigation-item>
        </c-side-navigation-item>

        <c-side-navigation-title>Components</c-side-navigation-title>

        <c-text-field
          v-model="query"
          v-control
          class="mr-6 mb-2"
          placeholder="Search for a component"
          hide-details
          shadow
        >
          <c-icon slot="pre" :path="mdiMagnify" size="16"></c-icon>
        </c-text-field>

        <c-side-navigation-item
          v-for="component in components"
          :key="component.name"
          :active="route?.params?.slug?.[0] === component.tag"
          class="capitalize"
          @keyup.enter="onNavigateToComponent(component.tag)"
          @click="onNavigateToComponent(component.tag)"
        >
          {{ component.name }}
        </c-side-navigation-item>

        <c-side-navigation-title>Miscellaneous</c-side-navigation-title>

        <c-side-navigation-item
          :active="route?.name === 'types'"
          @keyup.enter="navigateTo('/types')"
          @click="navigateTo('/types')"
        >
          <c-icon :path="mdiLanguageTypescript" size="16"></c-icon>
          Types
        </c-side-navigation-item>
      </c-side-navigation>

      <c-page>
        <div class="max-w-7xl">
          <slot />
        </div>
      </c-page>
    </div>
  </c-main>
</template>

<script lang="ts" setup>
import {
  mdiAngular,
  mdiInformationOutline,
  mdiLanguageHtml5,
  mdiLanguageTypescript,
  mdiMagnify,
  mdiVuejs,
} from '@mdi/js';
import { storeToRefs } from 'pinia';
import packageJson from '../package.json';

const version = ref(packageJson.version);

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

const components = computed(() =>
  parsedData.value
    .filter((component) => {
      if (query.value) {
        return component.docsTags.length && component.tag.includes(query.value);
      }

      return component.docsTags.length;
    })
    .map((data) => ({
      tag: data.tag,
      name: data.name,
    })),
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
