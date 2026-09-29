// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CDatePicker } from '@cscfi/csc-ui-react';
import type { CDatePickerRange } from '@cscfi/csc-ui';

export const Range = () => {
  const [leave, setLeave] = useState<CDatePickerRange | null>(null);

  return (
    <div>
      <CDatePicker
        value={leave}
        label="Leave"
        range
        clearable
        onChange={(event) => setLeave(event.detail as CDatePickerRange | null)}
      />

      <p>Value: {leave ? `${leave.start} – ${leave.end}` : 'null'}</p>
    </div>
  );
};
