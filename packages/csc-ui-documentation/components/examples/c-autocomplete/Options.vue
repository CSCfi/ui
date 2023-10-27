<template>
  <component-example rows>
    <template #title>Usage with c-option elements</template>

    <template #subtitle>
      Wrap the text content of the option with c-option-value to enable match
      highlighting
    </template>

    <c-row gap="8">
      <c-autocomplete
        ref="autocomplete"
        v-model="selection"
        v-control
        label="Countries"
        :items="filteredItems"
        :query="query"
        :items-per-page="10"
        @changeQuery="onQueryChange"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16" />

        <c-option
          v-for="(item, index) in filteredItems"
          :key="index"
          :value="item.value"
          :name="item.name"
        >
          <c-row align="center" gap="16">
            <c-tag active flat>{{ item.value }}</c-tag>

            <c-option-value>{{ item.name }}</c-option-value>
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
  query.value = event.detail.toString();
};
</script>
