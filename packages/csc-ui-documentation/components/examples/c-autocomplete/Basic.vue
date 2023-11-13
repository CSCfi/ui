<template>
  <component-example rows name="basic">
    <template #title>Basic usage</template>

    <c-row gap="8">
      <c-autocomplete
        id="listOfCountriesBasic"
        v-model="selection"
        v-control
        label="Countries"
        hide-details
        :items="filteredItems"
        :query="query"
        :items-per-page="10"
        style="flex: 1"
        @input="onQueryChange($event)"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16" />
      </c-autocomplete>

      <c-button @click="onAddTag()" @keyup.enter="onAddTag()">Add</c-button>
    </c-row>

    <c-tags v-if="tags.length" class="mt-3">
      <c-tag
        v-for="(tag, index) of tags"
        :key="index"
        closeable
        @click="onRemoveTag(index)"
        @keyup.enter="onRemoveTag(index)"
      >
        {{ tag.name }}
      </c-tag>
    </c-tags>
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

const tags = ref<CAutocompleteItem[]>([]);

const onAddTag = () => {
  if (selection.value) tags.value.push(selection.value);

  selection.value = null;
  query.value = '';
};

const onRemoveTag = (index: number) => {
  tags.value.splice(index, 1);
};

const onQueryChange = (event: InputEvent) => {
  query.value = (event.target as HTMLCAutocompleteElement).query;
};
</script>
