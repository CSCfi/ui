import { COtpInput } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [code, setCode] = useState('');

  return (
    <div>
      <COtpInput
        hint="Enter the 6-digit code we sent you"
        label="OTP"
        onUpdateValue={(event) => setCode(event.detail as string)}
      />

      <p>Code: {code}</p>
    </div>
  );
};
