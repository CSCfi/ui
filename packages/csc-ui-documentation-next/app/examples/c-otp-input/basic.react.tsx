// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { COtpInput } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [code, setCode] = useState<string | null>(null);

  return (
    <div>
      <COtpInput
        label="OTP"
        hint="Enter the 6-digit code we sent you"
        onChangeValue={(event) => setCode(event.detail as string | null)}
      />

      <span>Code: {code ?? 'incomplete'}</span>
    </div>
  );
};
