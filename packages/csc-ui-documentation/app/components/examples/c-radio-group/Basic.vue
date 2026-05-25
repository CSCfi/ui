<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-radio-group
      v-model="selectedItem"
      v-control
      :items="items"
      hide-details
      return-object
    >
      Example radio buttons with a
      <c-link underline>link</c-link>
      in the label
    </c-radio-group>

    <p class="mb-6">Selected: {{ selectedItem }}</p>

    <c-radio-group
      v-model="selectedItemValue"
      v-control
      :items="items"
      label="Label with a prop and return value"
      hide-details
    />

    <p>Selected: {{ selectedItemValue }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const items = [
  { name: 'Radio 1', value: 'radio_one' },
  { name: 'Radio 2', value: 'radio_two' },
  { name: 'Radio 3', value: 'radio_three' },
];

const selectedItem = ref(items[0]);

const selectedItemValue = ref(items[1].value);
</script>
