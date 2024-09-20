<template>
  <component-example rows name="justification">
    <template #title>Tab placement</template>

    <c-tabs v-model="tab" v-control :justify="justifyTabs">
      <c-tab value="tab1">
        <div class="relative px-2">
          One
          <div
            class="absolute -top-2 -right-2 bg-red-400 text-white w-4 min-h-4 rounded-full grid place-content-center text-xs"
          >
            1
          </div>
        </div>
      </c-tab>

      <c-tab value="tab2">Two</c-tab>

      <c-tab value="tab3">Three</c-tab>

      <c-tab-items slot="items">
        <c-tab-item value="tab1">
          This is the content for the first tab
        </c-tab-item>

        <c-tab-item value="tab2">
          This is the content for the second tab
        </c-tab-item>

        <c-tab-item value="tab3">
          This is the content for the third tab
        </c-tab-item>
      </c-tab-items>
    </c-tabs>

    <c-radio-group
      v-model="justifyTabs"
      v-control
      :items="options"
      inline
      hide-details
    >
      Change the tab placement
    </c-radio-group>
  </component-example>
</template>

<script setup lang="ts">
import { CRadioGroupItem, CTabsJustify } from '@cscfi/csc-ui';
import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3';

const tab = ref<Tab>('tab1');

const justifyTabs = ref<CTabsJustify>('start');

const options: CRadioGroupItem[] = [
  { value: 'start', name: 'Start' },
  { value: 'center', name: 'Center' },
  { value: 'end', name: 'End' },
  { value: 'stretch', name: 'Stretch' },
];
</script>
