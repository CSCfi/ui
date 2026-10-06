import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Today = () => {
  const [date, setDate] = useState<null | string>('2025-03-14');

  return (
    <div>
      <CDatePicker
        hint="Today under the calendar sets the field back to today"
        label="Due date"
        onChange={(event) => setDate(event.detail as null | string)}
        showToday
        value={date}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
