<template>
  <div>
    <!-- The default filter matches the start of the label; this one matches
         anywhere in it. -->
    <c-autocomplete
      v-model="country"
      :filter
      :items
      hint="Matches anywhere in the label"
      label="Country"
      placeholder="Type to filter"
      clearable
    />

    <p>Value: {{ country ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import type { CAutocompleteFilter, CAutocompleteItem } from '@cscfi/csc-ui';

import { ref } from 'vue';

const items: CAutocompleteItem[] = [
  { name: 'Austria', value: 'at' },
  { name: 'Denmark', value: 'dk' },
  { name: 'Estonia', value: 'ee' },
  { name: 'Finland', value: 'fi' },
  { name: 'France', value: 'fr' },
  { name: 'Germany', value: 'de' },
  { name: 'Iceland', value: 'is' },
  { name: 'Netherlands', value: 'nl' },
  { name: 'Norway', value: 'no' },
  { name: 'Sweden', value: 'se' },
];

// Typed via CAutocompleteFilter, so `option` and `query` are fully inferred.
// A custom-element binding can't infer an inline arrow's params, so define
// the predicate here rather than in the template.
const filter: CAutocompleteFilter = (option, query) =>
  option.label.toLowerCase().includes(query.toLowerCase());

const country = ref<null | string>(null);
</script>
