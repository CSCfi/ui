// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { COption, CSelect } from '@cscfi/csc-ui-react';

export const Small = () => {
  const [country, setCountry] = useState<string | null>('fi');

  return (
    <div>
      <CSelect
        value={country}
        label="Country"
        size="small"
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
      </CSelect>
    </div>
  );
};
