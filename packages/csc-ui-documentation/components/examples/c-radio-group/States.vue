<template>
  <component-example name="states" rows>
    <template #title>Hint and error states</template>

    <c-radio-group
      v-model="selectedInlineValue"
      v-control
      :items="items"
      :valid="isValid"
      hint="Please select a value"
      validation="This is a required value"
    >
      Inline radio buttons
    </c-radio-group>

    <c-switch v-model="isValid" v-control>Toggle validity</c-switch>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const items = [
  { name: 'Radio 1', value: 'radio_one' },
  { name: 'Radio 2', value: 'radio_two' },
  { name: 'Radio 3', value: 'radio_three' },
];

const selectedInlineValue = ref(items[2].value);

const isValid = ref(true);
</script>
