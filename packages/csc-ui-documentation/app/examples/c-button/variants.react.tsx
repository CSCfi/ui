// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton } from '@cscfi/csc-ui-react';

export const Variants = () => (
  <div className="example-grid">
    <div className="example-row">
      <CButton>Primary</CButton>
      <CButton variant="secondary">Secondary</CButton>
      <CButton variant="success">Success</CButton>
      <CButton variant="info">Info</CButton>
      <CButton variant="warning">Warning</CButton>
      <CButton variant="danger">Danger</CButton>
    </div>

    <div className="example-row">
      <CButton appearance="outlined">Primary</CButton>
      <CButton appearance="outlined" variant="secondary">
        Secondary
      </CButton>
      <CButton appearance="outlined" variant="success">
        Success
      </CButton>
      <CButton appearance="outlined" variant="info">
        Info
      </CButton>
      <CButton appearance="outlined" variant="warning">
        Warning
      </CButton>
      <CButton appearance="outlined" variant="danger">
        Danger
      </CButton>
    </div>

    <div className="example-row">
      <CButton appearance="ghost">Primary</CButton>
      <CButton appearance="ghost" variant="secondary">
        Secondary
      </CButton>
      <CButton appearance="ghost" variant="success">
        Success
      </CButton>
      <CButton appearance="ghost" variant="info">
        Info
      </CButton>
      <CButton appearance="ghost" variant="warning">
        Warning
      </CButton>
      <CButton appearance="ghost" variant="danger">
        Danger
      </CButton>
    </div>

    <div className="example-row">
      <CButton appearance="text">Primary</CButton>
      <CButton appearance="text" variant="secondary">
        Secondary
      </CButton>
      <CButton appearance="text" variant="success">
        Success
      </CButton>
      <CButton appearance="text" variant="info">
        Info
      </CButton>
      <CButton appearance="text" variant="warning">
        Warning
      </CButton>
      <CButton appearance="text" variant="danger">
        Danger
      </CButton>
    </div>
  </div>
);
