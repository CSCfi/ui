// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { COption, CSelect } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [country, setCountry] = useState<string | null>(null);

  return (
    <div>
      <CSelect
        value={country}
        clearable
        hint="The list opens on click or with the arrow keys"
        label="Country"
        placeholder="Choose a country"
        onChangeValue={(event) => setCountry(event.detail as string | null)}
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
      </CSelect>

      <p>Value: {country ?? 'null'}</p>
    </div>
  );
};
