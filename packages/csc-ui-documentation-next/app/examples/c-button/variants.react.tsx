// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton } from '@cscfi/csc-ui-next-react';

export const Variants = () => (
  <div className="example-row">
    <CButton>Default</CButton>
    <CButton outlined>Outlined</CButton>
    <CButton ghost>Ghost</CButton>
    <CButton text>Text</CButton>
    <CButton danger>Danger</CButton>
    <CButton disabled>Disabled</CButton>
  </div>
);
