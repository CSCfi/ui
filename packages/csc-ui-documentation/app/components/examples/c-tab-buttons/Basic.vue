<template>
  <component-example name="basic" rows>
    <template #title>Basic usage {{ model }}</template>

    <c-tab-buttons v-model="model" v-control>
      <c-tab-button value="one">One</c-tab-button>

      <c-tab-button value="two">Two</c-tab-button>

      <c-tab-button value="three">Three</c-tab-button>
    </c-tab-buttons>
  </component-example>
</template>

<script setup lang="ts">
const model = defineModel<'one' | 'two' | 'three'>({ default: 'one' });
</script>
