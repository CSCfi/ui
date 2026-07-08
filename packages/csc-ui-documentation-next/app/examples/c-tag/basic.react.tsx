// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTag } from '@cscfi/csc-ui-next-react';

export const Basic = () => (
  <div className="example-row">
    <CTag>Default</CTag>
    <CTag active>Active</CTag>
    <CTag badge="3">With badge</CTag>
    <CTag flat>Flat</CTag>
    <CTag size="small">Small</CTag>
  </div>
);
