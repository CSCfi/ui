// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';
import type { CTimePickerRange } from '@cscfi/csc-ui';

export const Range = () => {
  const [maintenance, setMaintenance] = useState<CTimePickerRange | null>(null);

  return (
    <div>
      <CTimePicker
        value={maintenance}
        hint="An end before the start spans midnight"
        label="Maintenance maintenance"
        range
        clearable
        onChange={(event) =>
          setMaintenance(event.detail as CTimePickerRange | null)
        }
      />

      <p>
        Value:{' '}
        {maintenance ? `${maintenance.start} – ${maintenance.end}` : 'null'}
      </p>
    </div>
  );
};
