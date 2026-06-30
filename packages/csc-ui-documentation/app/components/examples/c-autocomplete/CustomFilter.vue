<template>
  <component-example rows name="custom-filter">
    <template #title>Custom filter method</template>

    <template #subtitle>
      The default filter matches the start of the label; this one matches
      anywhere
    </template>

    <c-autocomplete
      v-model="selection"
      class="max-w-90"
      label="Countries"
      placeholder="Type to filter anywhere..."
      :items="items"
      :filter="filter"
      :items-per-page="8"
      clearable
      hide-details
    >
      <c-icon slot="pre" :path="mdiEarth" :size="16" />
    </c-autocomplete>

    <p class="mt-4">
      Selected value: <c-tag flat>{{ selection || 'none' }}</c-tag>
    </p>
  </component-example>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mdiEarth } from '@mdi/js';
import type { CAutocompleteFilter, CAutocompleteItem } from '@cscfi/csc-ui-next';
import countries from '../../data/countries.json';

const selection = ref('');

// Typed via CAutocompleteFilter, so `option` and `query` are fully inferred.
// A custom-element binding can't infer the inline arrow's params, so define it
// here rather than inline in the template.
const filter: CAutocompleteFilter = (option, query) =>
  option.label.toLowerCase().includes(query.toLowerCase());

const items = computed<CAutocompleteItem[]>(() =>
  Object.keys(countries)
    .map((key) => ({
      value: key,
      name: countries[key as keyof typeof countries],
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
);
</script>
