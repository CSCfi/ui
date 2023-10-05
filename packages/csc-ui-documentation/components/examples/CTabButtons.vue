<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-tab-buttons>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>
  </component-example>

  <component-example name="mandatory" rows>
    <template #title>Mandatory selection</template>

    <c-tab-buttons mandatory>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>
  </component-example>

  <component-example name="disabled" rows>
    <template #title>Disabled</template>

    <c-tab-buttons disabled>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button>Three</c-button>
    </c-tab-buttons>

    <c-tab-buttons>
      <c-button>One</c-button>
      <c-button>Two</c-button>
      <c-button disabled>Three</c-button>
    </c-tab-buttons>
  </component-example>

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
// @example-start|tabs
import { ref } from 'vue';

const tab = ref('tab1');
// @example-end
</script>

<style lang="scss"></style>
