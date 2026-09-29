// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTextField } from '@cscfi/csc-ui-react';

export const Masked = () => {
  const [phone, setPhone] = useState('');

  return (
    <div>
      <CTextField
        value={phone}
        hint="5–12 digits after the country code"
        label="Phone"
        mask="+358 #####[#######]"
        type="tel"
        onChangeValue={(event) => setPhone(event.detail as string)}
      />

      <p>Value: {phone}</p>
    </div>
  );
};
