<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>
    <template #subtitle>With one to three level navigation</template>

    <c-side-navigation>
      <c-side-navigation-item
        :active="currentMenuItem === 'about'"
        @keyup.enter="onNavigation('about')"
        @click="onNavigation('about')"
      >
        <c-icon :path="mdiInformationOutline" size="16"></c-icon>
        About
      </c-side-navigation-item>

      <c-side-navigation-title>Two level navigation</c-side-navigation-title>

      <c-side-navigation-item :active="false">
        <c-icon :path="mdiEye" size="16"></c-icon>
        Examples

        <c-sub-navigation-item
          slot="subnavitem"
          :active="currentMenuItem === 'html'"
          class="capitalize"
          @keyup.enter="onNavigation('html')"
          @click="onNavigation('html')"
        >
          <c-icon :path="mdiLanguageHtml5" size="16"></c-icon>
          Html
        </c-sub-navigation-item>

        <c-sub-navigation-item
          slot="subnavitem"
          :active="currentMenuItem === 'js'"
          class="capitalize"
          @keyup.enter="onNavigation('js')"
          @click="onNavigation('js')"
        >
          <c-icon :path="mdiLanguageJavascript" size="16"></c-icon>
          Javascript
        </c-sub-navigation-item>
      </c-side-navigation-item>

      <c-side-navigation-title>Three level navigation</c-side-navigation-title>

      <c-side-navigation-item :active="false">
        <c-icon :path="mdiPackageVariantClosed" size="16"></c-icon>
        Components

        <c-side-navigation-item slot="subnavitem" :active="false">
          <c-icon :path="mdiButtonCursor" size="16"></c-icon>
          Buttons

          <c-sub-navigation-item
            slot="subnavitem"
            :active="currentMenuItem === 'button'"
            class="capitalize"
            @keyup.enter="onNavigation('button')"
            @click="onNavigation('button')"
          >
            Button
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            :active="currentMenuItem === 'icon-button'"
            class="capitalize"
            @keyup.enter="onNavigation('icon-button')"
            @click="onNavigation('icon-button')"
          >
            Icon Button
          </c-sub-navigation-item>
        </c-side-navigation-item>
      </c-side-navigation-item>

      <c-side-navigation-item :active="false">
        <c-icon :path="mdiCog" size="16"></c-icon>
        Settings

        <c-side-navigation-item slot="subnavitem" :active="false">
          <c-icon :path="mdiPalette" size="16"></c-icon>
          Colors

          <c-sub-navigation-item
            slot="subnavitem"
            :active="currentMenuItem === 'accent'"
            class="capitalize"
            @keyup.enter="onNavigation('accent')"
            @click="onNavigation('accent')"
          >
            <span class="h-3 w-3 rounded-full bg-accent-600"></span>
            Accent
          </c-sub-navigation-item>

          <c-sub-navigation-item
            slot="subnavitem"
            :active="currentMenuItem === 'secondary'"
            class="capitalize"
            @keyup.enter="onNavigation('secondary')"
            @click="onNavigation('secondary')"
          >
            <span class="h-3 w-3 rounded-full bg-secondary-600"></span>
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
