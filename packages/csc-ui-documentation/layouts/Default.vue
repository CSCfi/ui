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
          <c-icon :path="mdiInformationOutline" />
          About
        </c-side-navigation-item>

        <c-side-navigation-item
          :active="route?.fullPath.startsWith('/getting-started')"
        >
          Getting Started

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.name === 'getting-started-angular'"
            @keyup.enter="navigateTo('/getting-started/angular')"
            @click="navigateTo('/getting-started/angular')"
          >
            <c-icon :path="mdiAngular" />
            Angular
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.name === 'getting-started-html'"
            @keyup.enter="navigateTo('/getting-started/html')"
            @click="navigateTo('/getting-started/html')"
          >
            <c-icon :path="mdiLanguageHtml5" />
            Html page
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.name === 'getting-started-vue3'"
            @keyup.enter="navigateTo('/getting-started/vue3')"
            @click="navigateTo('/getting-started/vue3')"
          >
            <c-icon :path="mdiVuejs" />
            Vue 3
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            class="capitalize"
            :active="route?.name === 'getting-started-vue2'"
            @keyup.enter="navigateTo('/getting-started/vue2')"
            @click="navigateTo('/getting-started/vue2')"
          >
            <c-icon :path="mdiVuejs" />
            Vue 2
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
          <c-icon slot="pre" :path="mdiMagnify" size="16" />
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

        <c-side-navigation-title>Design tokens</c-side-navigation-title>

        <c-side-navigation-item
          :active="route?.name === 'design-tokens-color'"
          @keyup.enter="navigateTo('/design-tokens/color')"
          @click="navigateTo('/design-tokens/color')"
        >
          <c-icon :path="mdiPalette" size="16" />
          Color
        </c-side-navigation-item>

        <c-side-navigation-item
          :active="route?.name === 'design-tokens-customization'"
          @keyup.enter="navigateTo('/design-tokens/customization')"
          @click="navigateTo('/design-tokens/customization')"
        >
          <c-icon :path="mdiFormatPaint" size="16" />
          Customization
        </c-side-navigation-item>

        <c-side-navigation-title>Miscellaneous</c-side-navigation-title>

        <c-side-navigation-item
          :active="route?.name === 'types'"
          @keyup.enter="navigateTo('/types')"
          @click="navigateTo('/types')"
        >
          <c-icon :path="mdiLanguageTypescript" size="16" />
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
  mdiFormatPaint,
  mdiInformationOutline,
  mdiLanguageHtml5,
  mdiLanguageTypescript,
  mdiMagnify,
  mdiPalette,
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
