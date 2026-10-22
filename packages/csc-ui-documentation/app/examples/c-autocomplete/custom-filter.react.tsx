import type { CAutocompleteFilter, CAutocompleteItem } from '@cscfi/csc-ui';

import { CAutocomplete } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

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
  const [country, setCountry] = useState<null | string>(null);

  return (
    <div>
      <CAutocomplete
        clearable
        filter={filter}
        hint="Matches anywhere in the label"
        items={items}
        label="Country"
        onChangeValue={(event) => setCountry(event.detail as null | string)}
        placeholder="Type to filter"
        value={country}
      />

      <p>Value: {country ?? 'null'}</p>
    </div>
  );
};
