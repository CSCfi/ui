// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CRow } from '@cscfi/csc-ui-next-react';

export const Justify = () => {
  return (
    <div>
      <CRow align="center" justify="space-between">
        <CButton size="small" outlined>
          Back
        </CButton>
        <span>Step 2 of 3</span>
        <CButton size="small">Next</CButton>
      </CRow>
    </div>
  );
};
