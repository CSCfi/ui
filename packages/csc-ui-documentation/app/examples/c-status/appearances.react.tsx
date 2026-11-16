// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CStatus } from '@cscfi/csc-ui-react';

export const Appearances = () => (
  <div className="example-grid">
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

    <div className="example-row">
      <CStatus appearance="outlined" marker="dot">
        Draft
      </CStatus>
      <CStatus appearance="outlined" marker="dot" type="info">
        Pending
      </CStatus>
      <CStatus appearance="outlined" marker="dot" type="success">
        Active
      </CStatus>
      <CStatus appearance="outlined" marker="dot" type="warning">
        Expiring
      </CStatus>
      <CStatus appearance="outlined" marker="dot" type="error">
        Failed
      </CStatus>
    </div>
  </div>
);
