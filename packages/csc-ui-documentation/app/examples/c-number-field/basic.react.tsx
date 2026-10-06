import { CNumberField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [count, setCount] = useState<null | number>(null);

  return (
    <div>
      <CNumberField
        hint="A whole number"
        label="Population"
        onChange={(event) => setCount(event.detail as null | number)}
        value={count}
      />

      <p>Value: {count ?? 'null'}</p>
    </div>
  );
};
