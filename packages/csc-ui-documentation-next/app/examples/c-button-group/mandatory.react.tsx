// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CButtonGroup } from '@cscfi/csc-ui-next-react';

export const Mandatory = () => {
  const [align, setAlign] = useState('left');

  return (
    <div className="example-row">
      <CButtonGroup
        label="Alignment"
        mandatory
        value={align}
        onChange={(event) => setAlign(event.detail as string)}
      >
        <CButton value="left">Left</CButton>
        <CButton value="center">Center</CButton>
        <CButton value="right">Right</CButton>
      </CButtonGroup>

      <p>Selected: {align} — the active button cannot be toggled off</p>
    </div>
  );
};
