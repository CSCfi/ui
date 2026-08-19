// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CAutocomplete } from '@cscfi/csc-ui-react';
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

export const CustomFilter = () => {
  const [country, setCountry] = useState<string | null>(null);

  return (
    <div>
      <CAutocomplete
        value={country}
        filter={filter}
        items={items}
        clearable
        hint="Matches anywhere in the label"
        label="Country"
        placeholder="Type to filter"
        onChangeValue={(event) => setCountry(event.detail as string | null)}
      />

      <p>Value: {country ?? 'null'}</p>
    </div>
  );
};
