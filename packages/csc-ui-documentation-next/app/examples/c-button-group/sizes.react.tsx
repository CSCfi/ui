// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CButtonGroup } from '@cscfi/csc-ui-next-react';

export const Sizes = () => (
  <div className="example-row">
    <CButtonGroup value="list" mandatory>
      <CButton value="list">List</CButton>
      <CButton value="grid">Grid</CButton>
    </CButtonGroup>

    <CButtonGroup size="small" value="list" mandatory>
      <CButton value="list">List</CButton>
      <CButton value="grid">Grid</CButton>
    </CButtonGroup>
  </div>
);
