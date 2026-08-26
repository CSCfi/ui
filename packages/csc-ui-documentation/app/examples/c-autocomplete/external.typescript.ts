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

// With `external`, the autocomplete renders `items` verbatim and only emits
// `change:query`; filtering happens in a simulated server request. The event
// also fires with an empty string when the panel opens, which is what loads
// the initial unfiltered list.
const autocomplete = document.querySelector('c-autocomplete')!;

let debounce: ReturnType<typeof setTimeout> | undefined;

// Drop responses a newer query has superseded.
let requestId = 0;

const load = async (query: string) => {
  const id = ++requestId;
  autocomplete.loading = true;

  const result = await search(query);

  if (id !== requestId) return;
  autocomplete.items = result;
  autocomplete.loading = false;
};

// The component ships no debounce — do it in the handler, as here.
autocomplete.addEventListener('change:query', (event) => {
  clearTimeout(debounce);

  const query = event.detail;
  debounce = setTimeout(() => load(query), 300);
});

autocomplete.addEventListener('changeValue', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
