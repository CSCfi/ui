import { COption, CSelect } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const SelectAll = () => {
  const [countries, setCountries] = useState<string[]>(['fi']);

  return (
    <div>
      <CSelect
        clearable
        hint="Pick some, or all at once"
        label="Countries"
        maxTags={3}
        multiple
        onChangeValue={(event) => setCountries(event.detail as string[])}
        selectAll
        value={countries}
      >
        <COption name="Finland" value="fi">
          Finland
        </COption>
        <COption name="Sweden" value="se">
          Sweden
        </COption>
        <COption name="Norway" value="no">
          Norway
        </COption>
        <COption name="Denmark" value="dk">
          Denmark
        </COption>
        <COption name="Iceland" value="is">
          Iceland
        </COption>
        <COption disabled name="Faroe Islands" value="fo">
          Faroe Islands
        </COption>
      </CSelect>

      <p>Value: {countries.length ? countries.join(', ') : '[]'}</p>
    </div>
  );
};
