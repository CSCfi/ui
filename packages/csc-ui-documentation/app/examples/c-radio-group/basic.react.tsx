// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CRadio, CRadioGroup } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [plan, setPlan] = useState('free');

  return (
    <div>
      <CRadioGroup
        value={plan}
        hint="You can change the plan later"
        label="Subscription plan"
        onChangeValue={(event) => setPlan(event.detail as string)}
      >
        <CRadio value="free">Free</CRadio>
        <CRadio value="pro">Pro</CRadio>
        <CRadio value="enterprise">Enterprise</CRadio>
      </CRadioGroup>
    </div>
  );
};
