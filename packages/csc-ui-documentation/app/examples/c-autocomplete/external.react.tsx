import type { CAutocompleteItem } from '@cscfi/csc-ui';

import { CAutocomplete } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useEffect, useRef, useState } from 'react';

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

export const External = () => {
  const [country, setCountry] = useState<null | string>(null);

  const [items, setItems] = useState<CAutocompleteItem[]>([]);

  const [loading, setLoading] = useState(false);

  const debounce = useRef<ReturnType<typeof setTimeout>>();

  // Drop responses a newer query has superseded.
  const requestId = useRef(0);

  const load = async (query: string) => {
    const id = ++requestId.current;
    setLoading(true);

    const result = await search(query);

    if (id !== requestId.current) return;
    setItems(result);
    setLoading(false);
  };

  const onQuery = (event: CustomEvent<string>) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(event.detail), 300);
  };

  useEffect(() => () => clearTimeout(debounce.current), []);

  return (
    <div>
      {/* With `external`, the autocomplete renders `items` verbatim and only
          emits `change:query`; filtering happens in a simulated server
          request. The event also fires with an empty string when the panel
          opens, which is what loads the initial unfiltered list. The
          component ships no debounce — do it in the handler, as here. */}
      <CAutocomplete
        clearable
        external
        hint="Options are fetched as you type"
        items={items}
        label="Country"
        loading={loading}
        onChangeQuery={onQuery}
        onChangeValue={(event) => setCountry(event.detail as null | string)}
        placeholder="Type to search"
        value={country}
      />

      <p>Value: {country ?? 'null'}</p>
    </div>
  );
};
