// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';

export const Sizes = () => (
  <div className="example-row">
    <CButtonGroup mandatory value="list">
      <CButton value="list">List</CButton>
      <CButton value="grid">Grid</CButton>
    </CButtonGroup>

    <CButtonGroup mandatory size="small" value="list">
      <CButton value="list">List</CButton>
      <CButton value="grid">Grid</CButton>
    </CButtonGroup>
  </div>
);
