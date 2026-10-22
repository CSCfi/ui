import { CNumberField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Decimals = () => {
  const [price, setPrice] = useState<null | number>(1234.5);

  return (
    <div>
      <CNumberField
        decimals={2}
        fixedDecimals
        hint="Up to two decimals"
        label="Price"
        min={0}
        onChange={(event) => setPrice(event.detail as null | number)}
        value={price}
      >
        <span slot="post">€</span>
      </CNumberField>

      <p>Value: {price ?? 'null'}</p>
    </div>
  );
};
