// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTabButton, CTabButtons } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [view, setView] = useState('week');

  return (
    <div className="example-row">
      <CTabButtons
        value={view}
        mandatory
        onChangeValue={(event) => setView(event.detail as string)}
      >
        <CTabButton value="day">Day</CTabButton>
        <CTabButton value="week">Week</CTabButton>
        <CTabButton value="month">Month</CTabButton>
      </CTabButtons>

      <span>Selected: {view}</span>
    </div>
  );
};
