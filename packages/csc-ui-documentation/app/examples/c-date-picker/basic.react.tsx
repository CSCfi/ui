import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [date, setDate] = useState<null | string>(null);

  return (
    <div>
      <CDatePicker
        clearable
        hint="Type a date or open the calendar"
        label="Start date"
        onChange={(event) => setDate(event.detail as null | string)}
        value={date}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
