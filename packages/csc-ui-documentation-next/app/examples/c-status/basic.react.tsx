// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CStatus } from '@cscfi/csc-ui-next-react';

export const Basic = () => (
  <div className="example-row">
    <CStatus>Default</CStatus>
    <CStatus type="info">Pending</CStatus>
    <CStatus type="success">Active</CStatus>
    <CStatus type="warning">Expiring</CStatus>
    <CStatus type="error">Failed</CStatus>
  </div>
);
