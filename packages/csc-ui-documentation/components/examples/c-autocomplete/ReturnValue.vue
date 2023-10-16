<template>
  <component-example rows>
    <template #title>Usage with 'return-value'</template>

    <c-row gap="8">
      <c-autocomplete
        v-model="selection"
        v-control
        label="Countries"
        hide-details
        :items="filteredItems"
        :query="query"
        :items-per-page="10"
        return-value
        @input="onQueryChange($event)"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16"></c-icon>
      </c-autocomplete>

      <c-button @click="onAddTag()" @keyup.enter="onAddTag()">Add</c-button>
    </c-row>

    <p style="margin: 16px 0 0">
      Added values:
      <c-tag flat>{{ tags.length }}</c-tag>
    </p>
    <ul>
      <li v-for="tag in tags" :key="tag">
        {{ tag }}
      </li>

      <li v-if="!tags.length">No added values</li>
    </ul>
  </component-example>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mdiEarth } from '@mdi/js';
import { CAutocompleteItem } from '@cscfi/csc-ui';
import countries from '../../data/countries.json';

const selection = ref('');

const query = ref<string>('');

const items = computed<CAutocompleteItem[]>(() =>
  Object.keys(countries)
    .map((key) => ({
      value: key,
      name: countries[key as keyof typeof countries],
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
);

const filteredItems = computed(() => {
  if (!query.value) return items.value;

  return items.value.filter(
    (i) => i.name?.toLowerCase().includes(query.value?.toLowerCase()),
  );
});

const tags = ref<string[]>([]);

const onAddTag = () => {
  if (selection.value) tags.value.push(selection.value);

  selection.value = '';
  query.value = '';
};

const onQueryChange = (event: InputEvent) => {
  query.value = (event.target as HTMLCAutocompleteElement).query;
};
</script>
