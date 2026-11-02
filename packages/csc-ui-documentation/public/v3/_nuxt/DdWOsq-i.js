const e=`
import { ref, computed } from 'vue';import { mdiEarth } from '@mdi/js';
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
`;export{e as default};
