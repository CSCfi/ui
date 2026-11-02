const e=`
import { ref, computed } from 'vue';import { mdiEarth } from '@mdi/js';
import type { CAutocompleteItem } from '@cscfi/csc-ui';
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
`;export{e as default};
