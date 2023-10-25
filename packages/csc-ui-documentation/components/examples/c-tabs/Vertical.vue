<template>
  <component-example name="noAnimation" rows>
    <template #title>Vertical tabs</template>

    <c-tabs v-model="tab" v-control vertical>
      <c-tab value="tab1">One</c-tab>

      <c-tab value="tab2">Two</c-tab>

      <c-tab value="tab3">Three</c-tab>

      <c-tab value="tab4">Four</c-tab>

      <c-tab value="tab5">Five</c-tab>

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

        <c-tab-item value="tab4">
          This is the content for the fourth tab
        </c-tab-item>

        <c-tab-item value="tab5">
          This is the content for the fifth tab
        </c-tab-item>
      </c-tab-items>
    </c-tabs>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3' | 'tab4' | 'tab5';

const tab = ref<Tab>('tab1');
</script>
