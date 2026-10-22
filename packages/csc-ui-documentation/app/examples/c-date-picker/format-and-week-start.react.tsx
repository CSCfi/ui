import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const FormatAndWeekStart = () => {
  const [date, setDate] = useState<null | string>('2026-09-28');

  return (
    <div>
      <CDatePicker
        firstDayOfWeek={0}
        format="M/d/yyyy"
        label="Due date"
        onChange={(event) => setDate(event.detail as null | string)}
        showWeekNumbers
        value={date}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
