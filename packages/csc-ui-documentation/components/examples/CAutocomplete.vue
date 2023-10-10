<template>
  <component-example name="basic" rows>
    <template #title>Basic usage</template>

    <c-row gap="8">
      <c-autocomplete
        id="listOfCountries"
        v-model="selection"
        v-control
        label="Countries"
        hide-details
        :items="filteredItems"
        :query="query"
        :items-per-page="10"
        style="flex: 1"
        @input="changeQuery($event)"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16"></c-icon>
      </c-autocomplete>

      <c-button @click="addTag()" @keyup.enter="addTag()">Add</c-button>
    </c-row>

    <div class="mt-3">
      <c-tag
        v-for="(tag, index) of addedTags"
        :key="index"
        closeable
        @click="removeTag(index)"
        @keyup.enter="removeTag(index)"
      >
        {{ tag.name }}
      </c-tag>
    </div>
  </component-example>

  <component-example name="returnValue" rows>
    <template #title>Usage with 'return-value'</template>

    <c-row gap="8">
      <c-autocomplete
        v-model="value"
        v-control
        label="Countries"
        hide-details
        :items="countryList"
        :query="searchString"
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

  <component-example name="customMenu" rows>
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
        @input="changeQuery($event)"
      >
        <c-icon slot="pre" :path="mdiEarth" size="16"></c-icon>

        <div
          v-for="(item, index) in filteredItems"
          :key="index"
          slot="customMenu"
          @click="setValue($event, item)"
        >
          <span>
            <b>Country {{ index + 1 }}</b>
          </span>

          <p>{{ item.name }}</p>
        </div>
      </c-autocomplete>
    </c-row>
  </component-example>
</template>

<script setup lang="ts">
// @example-start|basic|returnValue|customMenu
import { ref, computed } from 'vue';
import { mdiEarth } from '@mdi/js';
import { CAutocompleteItem } from '@cscfi/csc-ui';
import countries from '../data/countries.json';
// @example-end

// @example-start|basic|customMenu
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

const selection = ref();

const query = ref('');

const changeQuery = (event: InputEvent) => {
  query.value = (event.target as HTMLCAutocompleteElement).query;
};
// @example-end

// @example-start|basic
const addedTags = ref<CAutocompleteItem[]>([]);

const addTag = () => {
  if (selection.value) addedTags.value.push(selection.value);

  selection.value = null;
  query.value = '';
};

const removeTag = (index: number) => {
  addedTags.value.splice(index, 1);
};
// @example-end

// @example-start|returnValue
const tags = ref<string[]>([]);

const value = ref('');

const searchString = ref<string>('');

const countryList = computed(() => {
  if (!searchString.value) return items.value;

  return items.value.filter(
    (i) => i.name?.toLowerCase().includes(searchString.value?.toLowerCase()),
  );
});

const onAddTag = () => {
  if (value.value) tags.value.push(value.value);

  value.value = '';
  searchString.value = '';
};

const onQueryChange = (event: InputEvent) => {
  searchString.value = (event.target as HTMLCAutocompleteElement).query;
};
// @example-end

// @example-start|customMenu
const autocomplete = ref<HTMLCAutocompleteElement | null>();

const setValue = (event: Event, item: CAutocompleteItem) => {
  autocomplete.value?.setValue(event, item);
};
// @example-end
</script>

<style lang="scss">
div[slot='customMenu'] {
  cursor: pointer;
  padding: 5px 10px;
  p {
    margin: 0;
  }
}

div[aria-selected='true'],
div[slot='customMenu']:hover {
  background-color: var(--c-primary-200);
}
</style>
