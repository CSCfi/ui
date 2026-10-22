import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { end: `${year}-12-31`, start: `${year}-12-24` },
];

export const DisabledDates = () => {
  const [date, setDate] = useState<null | string>(null);

  return (
    <div>
      <CDatePicker
        disabledDates={disabledDates}
        hint="Weekdays from today, except Christmas week"
        isDateDisabled={isWeekend}
        label="Appointment"
        min={today}
        onChange={(event) => setDate(event.detail as null | string)}
        value={date}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
