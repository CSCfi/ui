<template>
  <component-example name="basic">
    <template #title>Basic usage</template>

    <template #subtitle>With one to three level navigation</template>

    <c-side-navigation>
      <c-side-navigation-item
        :active="currentMenuItem === 'about'"
        @keyup.enter="onNavigation('about')"
        @click="onNavigation('about')"
      >
        <c-icon :path="mdiInformationOutline" size="20" />
        About
      </c-side-navigation-item>

      <c-side-navigation-title>Two level navigation</c-side-navigation-title>

      <c-side-navigation-item :active="false">
        <c-icon :path="mdiEye" size="20" />
        Examples

        <c-sub-navigation-item
          :active="currentMenuItem === 'html'"
          @keyup.enter="onNavigation('html')"
          @click="onNavigation('html')"
        >
          <c-icon :path="mdiLanguageHtml5" size="20" />
          Html
        </c-sub-navigation-item>

        <c-sub-navigation-item
          :active="currentMenuItem === 'js'"
          @keyup.enter="onNavigation('js')"
          @click="onNavigation('js')"
        >
          <c-icon :path="mdiLanguageJavascript" size="20" />
          Javascript
        </c-sub-navigation-item>
      </c-side-navigation-item>

      <c-side-navigation-title>Three level navigation</c-side-navigation-title>

      <c-side-navigation-item :active="false">
        <c-icon :path="mdiPackageVariantClosed" size="20" />
        Components

        <c-side-navigation-item :active="false">
          <c-icon :path="mdiButtonCursor" size="20" />
          Buttons

          <c-sub-navigation-item
            :active="currentMenuItem === 'button'"
            @keyup.enter="onNavigation('button')"
            @click="onNavigation('button')"
          >
            Button
          </c-sub-navigation-item>

          <c-sub-navigation-item
            :active="currentMenuItem === 'icon-button'"
            @keyup.enter="onNavigation('icon-button')"
            @click="onNavigation('icon-button')"
          >
            Icon Button
          </c-sub-navigation-item>
        </c-side-navigation-item>
      </c-side-navigation-item>

      <c-side-navigation-item :active="false">
        <c-icon :path="mdiCog" size="20" />
        Settings

        <c-side-navigation-item :active="false">
          <c-icon :path="mdiPalette" size="20" />
          Colors

          <c-sub-navigation-item
            :active="currentMenuItem === 'accent'"
            @keyup.enter="onNavigation('accent')"
            @click="onNavigation('accent')"
          >
            <span class="h-3 w-3 rounded-full bg-accent-600" />
            Accent
          </c-sub-navigation-item>

          <c-sub-navigation-item
            :active="currentMenuItem === 'secondary'"
            @keyup.enter="onNavigation('secondary')"
            @click="onNavigation('secondary')"
          >
            <span class="h-3 w-3 rounded-full bg-secondary-600" />
            Secondary
          </c-sub-navigation-item>
        </c-side-navigation-item>
      </c-side-navigation-item>
    </c-side-navigation>
  </component-example>
</template>

<script setup lang="ts">
import {
  mdiButtonCursor,
  mdiCog,
  mdiEye,
  mdiInformationOutline,
  mdiLanguageHtml5,
  mdiLanguageJavascript,
  mdiPackageVariantClosed,
  mdiPalette,
} from '@mdi/js';

const currentMenuItem = ref('button');

const onNavigation = (item: string) => {
  currentMenuItem.value = item;
};
</script>

<style lang="scss"></style>
