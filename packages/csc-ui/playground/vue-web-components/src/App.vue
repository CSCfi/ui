<template>
  <c-card>
    <c-card-title>Normal Vue component</c-card-title>
    <c-card-content>
      <c-select
        v-model="selection"
        label="Select one"
        .items="items"
        return-value
        v-control
      ></c-select>

      <div v-if="!!selection">
        You selected option
        <b>{{ selection }}</b>
      </div>

      <div v-else>Select one please</div>
    </c-card-content>
  </c-card>

  <c-web-card></c-web-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { vControl } from 'csc-ui-vue-directive';

const selection = ref<string>();

const items = [
  { name: 'Option 1', value: 1 },
  { name: 'Option 2', value: 2 },
  { name: 'Option 3', value: 3 },
  { name: 'Option 4', value: 4 },
  { name: 'Option 5', value: 5 },
];
</script>
