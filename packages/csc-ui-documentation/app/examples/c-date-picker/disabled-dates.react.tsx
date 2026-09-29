// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';
import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { start: `${year}-12-24`, end: `${year}-12-31` },
];

export const DisabledDates = () => {
  const [date, setDate] = useState<string | null>(null);

  return (
    <div>
      <CDatePicker
        value={date}
        disabledDates={disabledDates}
        isDateDisabled={isWeekend}
        min={today}
        hint="Weekdays from today, except Christmas week"
        label="Appointment"
        onChange={(event) => setDate(event.detail as string | null)}
      />

      <p>Value: {date ?? 'null'}</p>
    </div>
  );
};
