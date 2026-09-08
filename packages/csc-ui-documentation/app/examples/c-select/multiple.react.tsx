// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { COption, CSelect } from '@cscfi/csc-ui-react';

export const Multiple = () => {
  const [countries, setCountries] = useState<string[]>(['fi', 'se']);

  return (
    <div>
      <CSelect
        value={countries}
        clearable
        hint="Pick as many as you like"
        label="Countries"
        maxTags={3}
        multiple
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
        <COption name="Estonia" value="ee">
          Estonia
        </COption>
      </CSelect>

      <p>Value: {countries.length ? countries.join(', ') : '[]'}</p>
    </div>
  );
};
