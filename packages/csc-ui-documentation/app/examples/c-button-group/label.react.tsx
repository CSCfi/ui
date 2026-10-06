// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';

export const Label = () => (
  <CButtonGroup label="Billing period" mandatory required value="monthly">
    <CButton value="monthly">Monthly</CButton>
    <CButton value="yearly">Yearly</CButton>
  </CButtonGroup>
);
