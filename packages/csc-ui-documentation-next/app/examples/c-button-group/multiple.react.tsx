// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CButtonGroup } from '@cscfi/csc-ui-next-react';

export const Multiple = () => {
  const [toppings, setToppings] = useState<string[]>(['cheese']);

  return (
    <div className="example-row">
      <CButtonGroup
        label="Toppings"
        multiple
        value={toppings}
        onChange={(event) => setToppings(event.detail as string[])}
      >
        <CButton value="cheese">Cheese</CButton>
        <CButton value="pepperoni">Pepperoni</CButton>
        <CButton value="mushroom">Mushroom</CButton>
      </CButtonGroup>

      <p>Selected: {toppings.length ? toppings.join(', ') : 'none'}</p>
    </div>
  );
};
