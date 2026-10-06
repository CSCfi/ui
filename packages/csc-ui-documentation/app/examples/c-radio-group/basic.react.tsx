import { CRadio, CRadioGroup } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [plan, setPlan] = useState('free');

  return (
    <div>
      <CRadioGroup
        hint="You can change the plan later"
        label="Subscription plan"
        onChangeValue={(event) => setPlan(event.detail as string)}
        value={plan}
      >
        <CRadio value="free">Free</CRadio>
        <CRadio value="pro">Pro</CRadio>
        <CRadio value="enterprise">Enterprise</CRadio>
      </CRadioGroup>
    </div>
  );
};
