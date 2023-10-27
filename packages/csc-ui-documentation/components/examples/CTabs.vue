<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-tabs v-model="tab" v-control>
      <c-tab value="tab1">One</c-tab>
      <c-tab value="tab2">Two</c-tab>
      <c-tab value="tab3">Three</c-tab>
    </c-tabs>

    <p>Current tab: {{ tab }}</p>
  </component-example>

  <component-example name="noBorder" rows>
    <template #title>Without border</template>

    <c-tabs value="tab1" borderless>
      <c-tab value="tab1">One</c-tab>
      <c-tab value="tab2">Two</c-tab>
      <c-tab value="tab3">Three</c-tab>
    </c-tabs>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { ref } from 'vue';

type Tab = 'tab1' | 'tab2' | 'tab3';

const tab = ref<Tab>('tab1');
// @example-end
</script>

<style lang="scss"></style>
