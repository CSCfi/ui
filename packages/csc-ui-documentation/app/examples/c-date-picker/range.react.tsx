import type { CDatePickerRange } from '@cscfi/csc-ui';

import { CDatePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Range = () => {
  const [leave, setLeave] = useState<CDatePickerRange | null>(null);

  return (
    <div>
      <CDatePicker
        clearable
        label="Leave"
        onChange={(event) => setLeave(event.detail as CDatePickerRange | null)}
        range
        value={leave}
      />

      <p>Value: {leave ? `${leave.start} – ${leave.end}` : 'null'}</p>
    </div>
  );
};
