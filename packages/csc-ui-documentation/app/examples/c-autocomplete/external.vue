<template>
  <div>
    <!-- With `external`, the autocomplete renders `items` verbatim and only
         emits `change:query`; filtering happens in a simulated server request.
         The event also fires with an empty string when the panel opens, which
         is what loads the initial unfiltered list. The component ships no
         debounce — do it in the handler, as here. -->
    <c-autocomplete
      v-model="country"
      :items.prop="items"
      :loading="loading"
      external
      hint="Options are fetched as you type"
      label="Country"
      placeholder="Type to search"
      clearable
      @change:query="onQuery"
    />

    <p>Value: {{ country ?? 'null' }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

import type { CAutocompleteItem } from '@cscfi/csc-ui';

// ---- a pretend server ------------------------------------------------
const ALL: CAutocompleteItem[] = [
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

const search = (query: string): Promise<CAutocompleteItem[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          ALL.filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase()),
          ),
        ),
      600,
    ),
  );
// -----------------------------------------------------------------------

const country = ref<string | null>(null);

const items = ref<CAutocompleteItem[]>([]);

const loading = ref(false);

let debounce: ReturnType<typeof setTimeout> | undefined;

// Drop responses a newer query has superseded.
let requestId = 0;

const load = async (query: string) => {
  const id = ++requestId;
  loading.value = true;

  const result = await search(query);

  if (id !== requestId) return;
  items.value = result;
  loading.value = false;
};

const onQuery = (event: Event) => {
  clearTimeout(debounce);

  const query = (event as CustomEvent<string>).detail;
  debounce = setTimeout(() => load(query), 300);
};

onBeforeUnmount(() => clearTimeout(debounce));
</script>
