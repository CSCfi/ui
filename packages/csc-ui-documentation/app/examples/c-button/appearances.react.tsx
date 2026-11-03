// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton } from '@cscfi/csc-ui-react';

export const Appearances = () => (
  <div className="example-row">
    <CButton>Default</CButton>
    <CButton appearance="outlined">Outlined</CButton>
    <CButton appearance="ghost">Ghost</CButton>
    <CButton appearance="text">Text</CButton>
    <CButton disabled>Disabled</CButton>
  </div>
);
