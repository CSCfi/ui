// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { COption, CSelect } from '@cscfi/csc-ui-react';

export const SelectAll = () => {
  const [countries, setCountries] = useState<string[]>(['fi']);

  return (
    <div>
      <CSelect
        value={countries}
        clearable
        hint="Pick some, or all at once"
        label="Countries"
        maxTags={3}
        multiple
        selectAll
        onChangeValue={(event) => setCountries(event.detail as string[])}
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
        <COption name="Faroe Islands" value="fo" disabled>
          Faroe Islands
        </COption>
      </CSelect>

      <p>Value: {countries.length ? countries.join(', ') : '[]'}</p>
    </div>
  );
};
