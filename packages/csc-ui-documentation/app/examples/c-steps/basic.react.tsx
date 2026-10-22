import { CButton, CStep, CSteps } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [step, setStep] = useState(1);

  return (
    <div>
      <CSteps value={step}>
        <CStep>Choose resources</CStep>
        <CStep>Billing details</CStep>
        <CStep>Review</CStep>
        <CStep>Confirmation</CStep>
      </CSteps>

      <div className="example-row">
        <CButton
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
          outlined
        >
          Previous
        </CButton>
        <CButton disabled={step === 5} onClick={() => setStep(step + 1)}>
          Next
        </CButton>
      </div>
    </div>
  );
};
