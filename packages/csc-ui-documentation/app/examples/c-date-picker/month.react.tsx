import type { CDatePickerRange } from '@cscfi/csc-ui';

import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Month = () => {
  const [billing, setBilling] = useState<null | string>(null);

  const [period, setPeriod] = useState<CDatePickerRange | null>(null);

  return (
    <div>
      <CDatePicker
        clearable
        hint="Type a month or open the month list"
        label="Billing month"
        onChange={(event) => setBilling(event.detail as null | string)}
        type="month"
        value={billing}
      />

      <p>Value: {billing ?? 'null'}</p>

      <CDatePicker
        clearable
        label="Reporting period"
        onChange={(event) => setPeriod(event.detail as CDatePickerRange | null)}
        range
        type="month"
        value={period}
      />

      <p>Value: {period ? `${period.start} – ${period.end}` : 'null'}</p>
    </div>
  );
};
