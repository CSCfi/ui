const e=`
import { ref, computed } from 'vue';import { mdiEarth } from '@mdi/js';
import type { CAutocompleteItem } from '@cscfi/csc-ui';
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

  return items.value.filter((i) =>
    i.name?.toLowerCase().includes(query.value?.toLowerCase()),
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

const onQueryChange = (event: CustomEvent<string>) => {
  query.value = event.detail;
};
`;export{e as default};
