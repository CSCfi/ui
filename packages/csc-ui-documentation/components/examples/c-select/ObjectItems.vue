<template>
  <component-example name="object-items" rows>
    <template #title>Items as array</template>

    <c-select
      v-model="value"
      v-control
      label="Country"
      placeholder="Choose country..."
      style="max-width: 360px"
      hide-details
      return-object
      :items="items"
      clearable
    />

    <p class="mt-3">Selected country: {{ value || 'None' }}</p>
  </component-example>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import countries from '../../data/countries.json';

const items = computed(() => {
  return Object.entries(countries).map(([value, name]) => ({
    name,
    value,
  }));
});

const value = ref(null);
</script>
