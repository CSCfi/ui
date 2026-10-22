import { CTextField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Masked = () => {
  const [phone, setPhone] = useState('');

  return (
    <div>
      <CTextField
        hint="5–12 digits after the country code"
        label="Phone"
        mask="+358 #####[#######]"
        onChangeValue={(event) => setPhone(event.detail as string)}
        type="tel"
        value={phone}
      />

      <p>Value: {phone}</p>
    </div>
  );
};
