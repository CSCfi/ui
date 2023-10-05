<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-tabs v-model="tab" v-control>
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

  <component-example name="noBorder" rows>
    <template #title>Without border</template>

    <c-tabs v-model="tab2" v-control borderless>
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

  <component-example name="noAnimation" rows>
    <template #title>Without animation</template>

    <c-tabs v-model="tab3" v-control disable-animation>
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
// @example-start|basic|noBorder|noAnimation
import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3';
// @example-end

// @example-start|basic
const tab = ref<Tab>('tab1');
// @example-end

// @example-start|noBorder
const tab2 = ref<Tab>('tab2');
// @example-end

// @example-start|noAnimation
const tab3 = ref<Tab>('tab1');
// @example-end
</script>

<style lang="scss"></style>
