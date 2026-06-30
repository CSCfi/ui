<template>
  <c-main class="h-100vh">
    <c-toolbar>
      <c-csc-logo />

      CSC Design System

      <c-spacer />

      <c-icon-button
        v-if="isNextImpl"
        text
        :title="
          themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        "
        :aria-label="
          themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
        "
        @click="toggleTheme"
      >
        <c-icon
          :path="themeMode === 'dark' ? mdiWeatherSunny : mdiWeatherNight"
        />
      </c-icon-button>

      <c-tag active flat>v{{ version }}</c-tag>

      <c-navigation-button v-if="isMobile" />
    </c-toolbar>

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
          class="capitalize"
          :active="route?.name === 'getting-started-angular'"
          @keyup.enter="navigateTo('/getting-started/angular')"
          @click="navigateTo('/getting-started/angular')"
        >
          <c-icon :path="mdiAngular" />
          Angular
        </c-sub-navigation-item>

        <c-sub-navigation-item
          class="capitalize"
          :active="route?.name === 'getting-started-html'"
          @keyup.enter="navigateTo('/getting-started/html')"
          @click="navigateTo('/getting-started/html')"
        >
          <c-icon :path="mdiLanguageHtml5" />
          Html page
        </c-sub-navigation-item>

        <c-sub-navigation-item
          class="capitalize"
          :active="route?.name === 'getting-started-react'"
          @keyup.enter="navigateTo('/getting-started/react')"
          @click="navigateTo('/getting-started/react')"
        >
          <c-icon :path="mdiReact" />
          React
        </c-sub-navigation-item>

        <c-sub-navigation-item
          class="capitalize"
          :active="route?.name === 'getting-started-vue3'"
          @keyup.enter="navigateTo('/getting-started/vue3')"
          @click="navigateTo('/getting-started/vue3')"
        >
          <c-icon :path="mdiVuejs" />
          Vue 3
        </c-sub-navigation-item>

        <c-sub-navigation-item
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

      <div class="pr-6 pb-2">
        <c-text-field
          v-model="query"
          v-control
          placeholder="Search for a component"
          hide-details
          shadow
        >
          <c-icon slot="pre" :path="mdiMagnify" :size="16" />
        </c-text-field>
      </div>

      <c-side-navigation-item
        v-for="component in components"
        :key="component.name"
        :active="route?.params?.slug?.[0] === component.tag"
        class="capitalize"
        @keyup.enter="onNavigateToComponent(component.tag)"
        @click="onNavigateToComponent(component.tag)"
      >
        {{ component.name }}

        <c-icon
          v-if="component.usesOldImpl"
          :path="mdiAlertCircle"
          :size="16"
          title="Still uses the old (Stencil) implementation"
          style="color: var(--c-warning-color, #d6601f); margin-left: 4px"
        />

        <c-icon
          v-if="component.usesTailwindVariants"
          :path="mdiCheckCircle"
          :size="16"
          title="Converted to Tailwind variants"
          style="color: var(--c-success-color, #25a35a); margin-left: 4px"
        />
      </c-side-navigation-item>

      <c-side-navigation-title>Design tokens</c-side-navigation-title>

      <c-side-navigation-item
        :active="route?.name === 'design-tokens-color'"
        @keyup.enter="navigateTo('/design-tokens/color')"
        @click="navigateTo('/design-tokens/color')"
      >
        <c-icon :path="mdiPalette" :size="16" />
        Color
      </c-side-navigation-item>

      <c-side-navigation-item
        :active="route?.name === 'design-tokens-customization'"
        @keyup.enter="navigateTo('/design-tokens/customization')"
        @click="navigateTo('/design-tokens/customization')"
      >
        <c-icon :path="mdiFormatPaint" :size="16" />
        Customization
      </c-side-navigation-item>

      <c-side-navigation-item
        :active="route?.name === 'design-tokens-dark-mode'"
        @keyup.enter="navigateTo('/design-tokens/dark-mode')"
        @click="navigateTo('/design-tokens/dark-mode')"
      >
        <c-icon :path="mdiThemeLightDark" :size="16" />
        Dark mode
      </c-side-navigation-item>

      <c-side-navigation-title>Miscellaneous</c-side-navigation-title>

      <c-side-navigation-item
        :active="route?.name === 'types'"
        @keyup.enter="navigateTo('/types')"
        @click="navigateTo('/types')"
      >
        <c-icon :path="mdiLanguageTypescript" :size="16" />
        Types
      </c-side-navigation-item>
    </c-side-navigation>

    <c-page>
      <slot />
    </c-page>
  </c-main>
</template>

<script lang="ts" setup>
import {
  mdiAlertCircle,
  mdiAngular,
  mdiCheckCircle,
  mdiFormatPaint,
  mdiInformationOutline,
  mdiLanguageHtml5,
  mdiLanguageTypescript,
  mdiMagnify,
  mdiPalette,
  mdiReact,
  mdiThemeLightDark,
  mdiVuejs,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js';
import { storeToRefs } from 'pinia';
import { migratedTags, tailwindVariantTags } from '@cscfi/csc-ui-next';
import packageJson from '../../package.json';

const version = ref(packageJson.version);

// In `next` mode, components whose tag isn't in `migratedTags` fall back to
// the old Stencil implementation. Flag them in the sidebar so migration
// progress is visible at a glance. In `stencil` mode everything is old, so
// the marker is suppressed.
const config = useRuntimeConfig();
const isNextImpl = config.public.cscUiImpl === 'next';

// Dark-mode toggle (next impl only — the Stencil theme is light-only).
const { mode: themeMode, toggle: toggleTheme } = useTheme();

const migratedSet = new Set(migratedTags);
const tailwindSet = new Set(tailwindVariantTags);

const query = ref('');

const route = useRoute();

const { currentComponent, parsedData } = storeToRefs(useExampleStore());

// `isMobile` is a viewport breakpoint, so measure the window directly. We used
// to ResizeObserver the `c-main` element, but its host is now `display:contents`
// (ADR-0004) and generates no box — its measured width is always 0, which would
// pin `isMobile` to `true` and hide the desktop side navigation entirely.
// Default to a desktop width so SSR renders the desktop layout; corrected on mount.
const width = ref(1280);

const updateWidth = () => {
  width.value = window.innerWidth;
};

onMounted(() => {
  updateWidth();
  window.addEventListener('resize', updateWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWidth);
});

const isMobile = computed(() => width.value < 1280);

const components = computed(() =>
  parsedData.value
    .filter((component) => {
      if (query.value) {
        return (
          component.docsTags.length &&
          component.tag.includes(query.value.toLowerCase())
        );
      }

      return component.docsTags.length;
    })
    .map((data) => ({
      tag: data.tag,
      name: data.name,
      usesOldImpl: isNextImpl && !migratedSet.has(data.tag),
      usesTailwindVariants: isNextImpl && tailwindSet.has(data.tag),
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
