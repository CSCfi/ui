import { COption, CSelect } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Small = () => {
  const [country, setCountry] = useState<null | string>('fi');

  return (
    <div>
      <CSelect
        label="Country"
        onChangeValue={(event) => setCountry(event.detail as null | string)}
        size="small"
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
      </CSelect>
    </div>
  );
};
