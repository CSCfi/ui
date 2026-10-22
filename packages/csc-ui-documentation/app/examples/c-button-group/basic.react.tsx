import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [view, setView] = useState<null | string>('week');

  return (
    <div className="example-row">
      <CButtonGroup
        onChange={(event) => setView(event.detail as null | string)}
        value={view}
      >
        <CButton value="day">Day</CButton>
        <CButton value="week">Week</CButton>
        <CButton value="month">Month</CButton>
      </CButtonGroup>

      <p>Selected: {view ?? 'none'}</p>
    </div>
  );
};
