// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';
import type { CDatePickerRange } from '@cscfi/csc-ui';

export const Month = () => {
  const [billing, setBilling] = useState<string | null>(null);
  const [period, setPeriod] = useState<CDatePickerRange | null>(null);

  return (
    <div>
      <CDatePicker
        value={billing}
        hint="Type a month or open the month list"
        label="Billing month"
        type="month"
        clearable
        onChange={(event) => setBilling(event.detail as string | null)}
      />

      <p>Value: {billing ?? 'null'}</p>

      <CDatePicker
        value={period}
        label="Reporting period"
        type="month"
        range
        clearable
        onChange={(event) => setPeriod(event.detail as CDatePickerRange | null)}
      />

      <p>Value: {period ? `${period.start} – ${period.end}` : 'null'}</p>
    </div>
  );
};
