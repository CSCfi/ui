// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CStep, CSteps } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  return (
    <div>
      <CSteps value="3">
        <CStep>Choose resources</CStep>
        <CStep>Billing details</CStep>
        <CStep>Review</CStep>
        <CStep>Confirmation</CStep>
      </CSteps>
    </div>
  );
};
