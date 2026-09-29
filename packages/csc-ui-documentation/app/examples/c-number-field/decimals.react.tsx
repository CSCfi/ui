// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CNumberField } from '@cscfi/csc-ui-react';

export const Decimals = () => {
  const [price, setPrice] = useState<number | null>(1234.5);

  return (
    <div>
      <CNumberField
        value={price}
        decimals={2}
        min={0}
        fixedDecimals
        hint="Up to two decimals"
        label="Price"
        onChange={(event) => setPrice(event.detail as number | null)}
      >
        <span slot="post">€</span>
      </CNumberField>

      <p>Value: {price ?? 'null'}</p>
    </div>
  );
};
