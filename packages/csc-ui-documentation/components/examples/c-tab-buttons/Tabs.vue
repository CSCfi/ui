<template>
  <component-example name="tabs" rows>
    <template #title>Usage as tab controller</template>

    <c-tabs v-model="tab" v-control borderless>
      <c-tab-buttons>
        <c-button value="tab1">One</c-button>

        <c-button value="tab2">Two</c-button>

        <c-button value="tab3">Three</c-button>
      </c-tab-buttons>

      <c-tab-items slot="items">
        <c-tab-item value="tab1">Tab 1</c-tab-item>

        <c-tab-item value="tab2">Tab 2</c-tab-item>

        <c-tab-item value="tab3">Tab 3</c-tab-item>
      </c-tab-items>
    </c-tabs>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tab = ref('tab1');
</script>
