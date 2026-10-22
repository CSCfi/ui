import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Mandatory = () => {
  const [align, setAlign] = useState('left');

  return (
    <div className="example-row">
      <CButtonGroup
        label="Alignment"
        mandatory
        onChange={(event) => setAlign(event.detail as string)}
        value={align}
      >
        <CButton value="left">Left</CButton>
        <CButton value="center">Center</CButton>
        <CButton value="right">Right</CButton>
      </CButtonGroup>

      <p>Selected: {align} — the active button cannot be toggled off</p>
    </div>
  );
};
