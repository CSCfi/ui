<template>
  <component-example rows name="options">
    <template #title>Usage with c-option elements</template>

    <template #subtitle>Use c-option-value for match highlighting</template>

    <c-row gap="8" nowrap align="start">
      <c-autocomplete
        ref="autocomplete"
        v-model="selection"
        v-control
        style="flex: 1"
        label="Countries"
        :query="query"
        :items-per-page="10"
        :loading="loading"
        @changeQuery="onQueryChange"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16" />

        <c-option
          v-for="(item, index) in filteredItems"
          :key="item.value"
          :value="item.value"
          :name="item.name"
          :disabled="index === 3"
        >
          <c-row align="center" gap="16" nowrap>
            <c-tag active flat>{{ item.value }}</c-tag>

            <c-option-value>{{ item.name }}</c-option-value>
          </c-row>
        </c-option>
      </c-autocomplete>

      <c-button :disabled="!selection" @click="add()" @keyup.enter="add()">
        Add
      </c-button>
    </c-row>

    <c-tags>
      <c-tag v-for="country in selections" :key="country">
        {{ country }}
      </c-tag>
    </c-tags>
  </component-example>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { mdiEarth } from '@mdi/js';
import type { CAutocompleteItem } from '@cscfi/csc-ui';
import countries from '../../data/countries.json';

const selection = ref();

const query = ref('');

const selections = ref<string[]>([]);

const loading = ref(false);

const autocomplete = ref<HTMLCAutocompleteElement | null>(null);

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

  return items.value.filter((i) =>
    i.name?.toLowerCase().includes(query.value?.toLowerCase()),
  );
});

const onQueryChange = (event: InputEvent) => {
  query.value = event.detail.toString();
};

const add = () => {
  selections.value.push(selection.value);

  autocomplete.value?.reset();
};
</script>
