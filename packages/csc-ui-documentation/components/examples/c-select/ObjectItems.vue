<template>
  <component-example name="objectItems" rows>
    <template #title>Items as array</template>

    <c-select
      v-model="value"
      v-control
      label="Country"
      return-value
      :items="items"
      placeholder="Choose country..."
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
