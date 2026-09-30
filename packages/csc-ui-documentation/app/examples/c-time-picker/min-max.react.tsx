// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';

export const MinMax = () => {
  const [time, setTime] = useState<string | null>(null);

  return (
    <div>
      <CTimePicker
        value={time}
        hint="Between 8.00 and 16.00"
        label="Pickup time"
        max="16:00"
        min="08:00"
        onChange={(event) => setTime(event.detail as string | null)}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
