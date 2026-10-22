import { CTimePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const MinMax = () => {
  const [time, setTime] = useState<null | string>(null);

  return (
    <div>
      <CTimePicker
        hint="Between 8.00 and 16.00"
        label="Pickup time"
        max="16:00"
        min="08:00"
        onChange={(event) => setTime(event.detail as null | string)}
        value={time}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
