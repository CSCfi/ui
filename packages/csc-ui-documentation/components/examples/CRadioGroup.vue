<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-radio-group v-model="selectedItem" v-control :items="items" hide-details>
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
      return-value
      hide-details
    />

    <p>Selected: {{ selectedItemValue }}</p>
  </component-example>

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

  <component-example name="states" rows>
    <template #title>Hint and error states</template>

    <c-radio-group
      v-model="selectedInlineValue"
      v-control
      :items="items"
      :valid="isValid"
      hint="Please select a value"
      validation="This is a required value"
      return-value
    >
      Inline radio buttons
    </c-radio-group>

    <c-switch v-model="isValid" v-control>Toggle error status</c-switch>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic
import { ref } from 'vue';

const items = [
  { label: 'Radio 1', value: 'radio_one' },
  { label: 'Radio 2', value: 'radio_two' },
  { label: 'Radio 3', value: 'radio_three' },
];

const selectedItem = ref(items[0]);

const selectedItemValue = ref(items[1].value);

const selectedInlineValue = ref(items[2].value);

const isValid = ref(true);
// @example-end
</script>

<style lang="scss"></style>
