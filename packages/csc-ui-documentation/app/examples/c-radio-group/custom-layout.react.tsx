// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CRadio, CRadioGroup } from '@cscfi/csc-ui-react';

const styles = `
/* The radios are ordinary light DOM: wrap them in your own layout markup and
   style it with your own CSS. Keep the label text inside the <c-radio> so the
   whole row stays click-associated. */
.plan-option {
  border: 1px solid var(--c-border);
  border-radius: 0.5rem;
  padding: 0 0.75rem;
}
`;

export const CustomLayout = () => {
  const [plan, setPlan] = useState('free');

  return (
    <>
      <style>{styles}</style>

      <CRadioGroup
        value={plan}
        hint="You can change the plan later"
        label="Subscription plan"
        onChangeValue={(event) => setPlan(event.detail as string)}
      >
        <div className="plan-option">
          <CRadio value="free">Free</CRadio>
        </div>
        <div className="plan-option">
          <CRadio value="pro">Pro</CRadio>
        </div>
        <div className="plan-option">
          <CRadio value="enterprise">Enterprise</CRadio>
        </div>
      </CRadioGroup>
    </>
  );
};
