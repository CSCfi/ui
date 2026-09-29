// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CNumberField } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [count, setCount] = useState<number | null>(null);

  return (
    <div>
      <CNumberField
        value={count}
        hint="A whole number"
        label="Population"
        onChange={(event) => setCount(event.detail as number | null)}
      />

      <p>Value: {count ?? 'null'}</p>
    </div>
  );
};
