// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';

export const Now = () => {
  const [time, setTime] = useState<string | null>('08:00');

  return (
    <div>
      <CTimePicker
        value={time}
        hint="Now under the columns commits the current minute"
        label="Arrival"
        minuteStep={15}
        showNow
        onChange={(event) => setTime(event.detail as string | null)}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
