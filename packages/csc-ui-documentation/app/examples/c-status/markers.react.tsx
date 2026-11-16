// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CStatus } from '@cscfi/csc-ui-react';

export const Markers = () => (
  <div className="example-grid">
    <div className="example-row">
      <CStatus marker="icon">Draft</CStatus>
      <CStatus marker="icon" type="info">
        Pending
      </CStatus>
      <CStatus marker="icon" type="success">
        Active
      </CStatus>
      <CStatus marker="icon" type="warning">
        Expiring
      </CStatus>
      <CStatus marker="icon" type="error">
        Failed
      </CStatus>
    </div>

    <div className="example-row">
      <CStatus marker="dot">Draft</CStatus>
      <CStatus marker="dot" type="info">
        Pending
      </CStatus>
      <CStatus marker="dot" type="success">
        Active
      </CStatus>
      <CStatus marker="dot" type="warning">
        Expiring
      </CStatus>
      <CStatus marker="dot" type="error">
        Failed
      </CStatus>
    </div>
  </div>
);
