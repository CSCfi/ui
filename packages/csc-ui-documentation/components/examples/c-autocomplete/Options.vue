<template>
  <component-example rows>
    <template #title>Usage with custom menu items</template>

    <c-row gap="8">
      <c-autocomplete
        ref="autocomplete"
        v-model="selection"
        v-control
        label="Countries"
        hide-details
        :items="filteredItems"
        :query="query"
        :items-per-page="10"
        :custom-menu="true"
        style="flex: 1"
        @input="onQueryChange($event)"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16"></c-icon>

        <c-option
          v-for="(item, index) in filteredItems"
          :key="index"
          :value="item.value"
          :name="item.name"
        >
          <c-row align="center" gap="16">
            <c-tag active flat>{{ item.value }}</c-tag>
            <p>{{ item.name }}</p>
          </c-row>
        </c-option>
      </c-autocomplete>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mdiEarth } from '@mdi/js';
import { CAutocompleteItem } from '@cscfi/csc-ui';
import countries from '../../data/countries.json';

const selection = ref();

const query = ref('');

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

const onQueryChange = (event: InputEvent) => {
  query.value = (event.target as HTMLCAutocompleteElement).query;
};
</script>
