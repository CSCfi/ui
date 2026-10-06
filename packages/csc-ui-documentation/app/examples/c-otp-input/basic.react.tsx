import { COtpInput } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [code, setCode] = useState<null | string>(null);

  return (
    <div>
      <COtpInput
        hint="Enter the 6-digit code we sent you"
        label="OTP"
        onChangeValue={(event) => setCode(event.detail as null | string)}
      />

      <p>Code: {code ?? 'incomplete'}</p>
    </div>
  );
};
