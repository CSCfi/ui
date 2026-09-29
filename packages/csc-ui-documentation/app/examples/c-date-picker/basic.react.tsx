// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [date, setDate] = useState<string | null>(null);

  return (
    <div>
      <CDatePicker
        value={date}
        hint="Type a date or open the calendar"
        label="Start date"
        clearable
        onChange={(event) => setDate(event.detail as string | null)}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
