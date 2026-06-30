<template>
  <component-example rows name="basic">
    <template #title>Usage with an array of objects</template>

    <template #subtitle>Returning an object on selection</template>

    <c-row gap="8">
      <c-autocomplete
        id="listOfCountriesBasic"
        v-model="selection"
        class="max-w-90"
        label="Countries"
        placeholder="Choose a country"
        :items="items"
        style="flex: 1"
        hide-details
        clearable
        return-object
      >
        <c-icon slot="pre" :path="mdiEarth" :size="16" />
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
import type { CAutocompleteItem } from '@cscfi/csc-ui-next';
import countries from '../../data/countries.json';

const selection = ref<CAutocompleteItem | null>(null);

const items = computed<CAutocompleteItem[]>(() =>
  Object.keys(countries)
    .map((key) => ({
      value: key,
      name: countries[key as keyof typeof countries],
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
);

const tags = ref<CAutocompleteItem[]>([]);

const onAddTag = () => {
  if (selection.value) tags.value.push(selection.value);

  selection.value = null;
};

const onRemoveTag = (index: number) => {
  tags.value.splice(index, 1);
};
</script>
