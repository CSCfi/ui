import { CTimePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Now = () => {
  const [time, setTime] = useState<null | string>('08:00');

  return (
    <div>
      <CTimePicker
        hint="Now under the columns commits the current minute"
        label="Arrival"
        minuteStep={15}
        onChange={(event) => setTime(event.detail as null | string)}
        showNow
        value={time}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
