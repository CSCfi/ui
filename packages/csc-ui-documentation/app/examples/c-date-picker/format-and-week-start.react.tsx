// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';

export const FormatAndWeekStart = () => {
  const [date, setDate] = useState<string | null>('2026-09-28');

  return (
    <div>
      <CDatePicker
        value={date}
        firstDayOfWeek={0}
        format="M/d/yyyy"
        label="Due date"
        showWeekNumbers
        onChange={(event) => setDate(event.detail as string | null)}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
