import type { CTimePickerRange } from '@cscfi/csc-ui';

import { CTimePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Range = () => {
  const [maintenance, setMaintenance] = useState<CTimePickerRange | null>(null);

  return (
    <div>
      <CTimePicker
        clearable
        hint="An end before the start spans midnight"
        label="Maintenance maintenance"
        onChange={(event) =>
          setMaintenance(event.detail as CTimePickerRange | null)
        }
        range
        value={maintenance}
      />

      <p>
        Value:{' '}
        {maintenance ? `${maintenance.start} – ${maintenance.end}` : 'null'}
      </p>
    </div>
  );
};
