// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CRow } from '@cscfi/csc-ui-react';

export const Basic = () => (
  <div>
    <CRow align="center" gap={12}>
      <CButton size="small" outlined>
        First
      </CButton>
      <CButton size="small" outlined>
        Second
      </CButton>
      <CButton size="small" outlined>
        Third
      </CButton>
    </CRow>
  </div>
);
