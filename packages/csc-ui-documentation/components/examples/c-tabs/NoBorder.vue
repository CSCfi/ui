<template>
  <component-example name="noBorder" rows>
    <template #title>Without border</template>

    <c-tabs v-model="tab" v-control borderless>
      <c-tab value="tab1">One</c-tab>

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
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3';

const tab = ref<Tab>('tab2');
</script>
