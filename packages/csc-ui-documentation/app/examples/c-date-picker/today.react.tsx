// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';

export const Today = () => {
  const [date, setDate] = useState<string | null>('2025-03-14');

  return (
    <div>
      <CDatePicker
        value={date}
        hint="Today under the calendar sets the field back to today"
        label="Due date"
        showToday
        onChange={(event) => setDate(event.detail as string | null)}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
