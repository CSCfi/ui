<template>
  <component-example name="noBorder" rows>
    <template #title>Without border</template>

    <c-tabs v-model="tab" v-control borderless>
      <c-tab value="tab1">One</c-tab>
      <c-tab value="tab2">Two</c-tab>
      <c-tab value="tab3">Three</c-tab>

      <c-tab-items slot="items">
        <c-tab-item value="tab1">1</c-tab-item>
        <c-tab-item value="tab2">2</c-tab-item>
        <c-tab-item value="tab3">3</c-tab-item>
      </c-tab-items>
    </c-tabs>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3';

const tab = ref<Tab>('tab2');
</script>
