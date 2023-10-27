<template>
  <component-example name="inline" rows>
    <template #title>Inline radio buttons</template>

    <c-radio-group
      v-model="selectedInlineValue"
      v-control
      :items="items"
      inline
      return-value
      hide-details
    >
      Inline radio buttons
    </c-radio-group>

    <p>Selected: {{ selectedInlineValue }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const items = [
  { name: 'Radio 1', value: 'radio_one' },
  { name: 'Radio 2', value: 'radio_two', disabled: true },
  { name: 'Radio 3', value: 'radio_three' },
];

const selectedInlineValue = ref(items[2].value);
</script>

<style lang="scss"></style>
