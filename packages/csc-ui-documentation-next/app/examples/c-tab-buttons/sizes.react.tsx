// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CTabButton, CTabButtons } from '@cscfi/csc-ui-next-react';

export const Sizes = () => (
  <div className="example-row">
    <CTabButtons value="list" mandatory>
      <CTabButton value="list">List</CTabButton>
      <CTabButton value="grid">Grid</CTabButton>
    </CTabButtons>

    <CTabButtons size="small" value="list" mandatory>
      <CTabButton value="list">List</CTabButton>
      <CTabButton value="grid">Grid</CTabButton>
    </CTabButtons>
  </div>
);
