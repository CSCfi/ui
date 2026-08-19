import type { CAutocompleteFilter, CAutocompleteItem } from '@cscfi/csc-ui';

const items: CAutocompleteItem[] = [
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

// The default filter matches the start of the label; this one matches
// anywhere in it.
const filter: CAutocompleteFilter = (option, query) =>
  option.label.toLowerCase().includes(query.toLowerCase());

// `filter` is a function, so it must be set as a DOM property.
const autocomplete = document.querySelector('c-autocomplete')!;
autocomplete.items = items;
autocomplete.filter = filter;

autocomplete.addEventListener('changeValue', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
