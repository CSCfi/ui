import { COption, CSelect } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [country, setCountry] = useState<null | string>(null);

  return (
    <div>
      <CSelect
        clearable
        hint="Each c-option provides a name and a value"
        label="Country"
        onChangeValue={(event) => setCountry(event.detail as null | string)}
        placeholder="Choose a country"
        value={country}
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
        <COption disabled name="Denmark" value="dk">
          Denmark
        </COption>
      </CSelect>

      <p>Value: {country ?? 'null'}</p>
    </div>
  );
};
