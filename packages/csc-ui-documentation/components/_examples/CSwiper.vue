<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-swiper v-model="currentTab" v-control>
      <c-swiper-tab
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :active="selectedTab === tab.value"
        :label="tab.label"
        :value="tab.value"
        :disabled="tab.disabled"
        @click="!tab.disabled && selectTab(tab)"
        @keyup.enter="!tab.disabled && selectTab(tab)"
      >
        <c-icon slot="icon" :path="mdiServer"></c-icon>

        Lorem ipsum dolor sit amet, consectetur adipiscing elit.

        <span v-if="index % 2 === 0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </span>
      </c-swiper-tab>
    </c-swiper>

    <p class="mt-3">Focused tab: {{ currentTab }}</p>

    <p class="mt-2">Selection: {{ selectionText }}</p>
  </component-example>

  <component-example name="string" rows>
    <template #title>Basic usage (string value)</template>

    <c-swiper v-model="currentTabItem" v-control>
      <c-swiper-tab
        v-for="(tab, index) in tabsItems"
        :key="tab.value"
        :active="selectedTabItem === tab.value"
        :label="tab.label"
        :value="tab.value"
        :disabled="tab.disabled"
        @click="!tab.disabled && selectTabItem(tab)"
        @keyup.enter="!tab.disabled && selectTabItem(tab)"
      >
        <c-icon slot="icon" :path="mdiServer"></c-icon>

        Lorem ipsum dolor sit amet, consectetur adipiscing elit.

        <span v-if="index % 2 === 0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </span>
      </c-swiper-tab>
    </c-swiper>

    <p class="mt-3">Focused tab: {{ currentTabItem }}</p>

    <p class="mt-2">Selection: {{ selectionItemText }}</p>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic|string
import { ref } from 'vue';
import { mdiServer } from '@mdi/js';
// @example-end

// @example-start|basic
type Tab = {
  label: string;
  value: number;
  disabled: boolean;
};

const currentTab = ref('');

const selectedTab = ref(1);

const selectionText = ref('Tab "One" selected');

const tabs: Tab[] = [
  { label: 'One', value: 1, disabled: false },
  { label: 'Two', value: 2, disabled: false },
  { label: 'Three', value: 3, disabled: false },
  { label: 'Four', value: 4, disabled: true },
  { label: 'Five', value: 5, disabled: false },
  { label: 'Six', value: 6, disabled: false },
];

const selectTab = (tab: Tab) => {
  selectedTab.value = tab.value;
  selectionText.value = `Tab "${tab.label}" selected`;
};

// @example-end

// @example-start|string
type TabItem = {
  label: string;
  value: string;
  disabled: boolean;
};

const currentTabItem = ref('');

const selectedTabItem = ref('tab6');

const selectionItemText = ref('Tab "Six" selected');

const tabsItems: TabItem[] = [
  { label: 'One', value: 'tab1', disabled: true },
  { label: 'Two', value: 'tab2', disabled: false },
  { label: 'Three', value: 'tab3', disabled: false },
  { label: 'Four', value: 'tab4', disabled: true },
  { label: 'Five', value: 'tab5', disabled: false },
  { label: 'Six', value: 'tab6', disabled: false },
];

const selectTabItem = (tab: TabItem) => {
  selectedTabItem.value = tab.value;
  selectionItemText.value = `Tab "${tab.label}" selected`;
};
// @example-end
</script>

<style lang="scss"></style>
