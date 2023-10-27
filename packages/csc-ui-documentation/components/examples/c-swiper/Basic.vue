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
        <c-icon slot="icon" :path="mdiServer" />

        Lorem ipsum dolor sit amet, consectetur adipiscing elit.

        <span v-if="index % 2 === 0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </span>
      </c-swiper-tab>
    </c-swiper>

    <p class="mt-3">Focused tab: {{ currentTab }}</p>

    <p class="mt-2">Selection: {{ selectionText }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { mdiServer } from '@mdi/js';

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
  selectionText.value = 'Tab "' + tab.label + '" selected';
};
</script>
