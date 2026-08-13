// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [view, setView] = useState<string | null>('week');

  return (
    <div className="example-row">
      <CButtonGroup
        value={view}
        onChange={(event) => setView(event.detail as string | null)}
      >
        <CButton value="day">Day</CButton>
        <CButton value="week">Week</CButton>
        <CButton value="month">Month</CButton>
      </CButtonGroup>

      <p>Selected: {view ?? 'none'}</p>
    </div>
  );
};
