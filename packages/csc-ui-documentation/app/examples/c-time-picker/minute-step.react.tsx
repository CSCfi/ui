import { CTimePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const MinuteStep = () => {
  const [time, setTime] = useState<null | string>(null);

  return (
    <div>
      <CTimePicker
        hint="Slots every 15 minutes; any typed time is kept"
        label="Appointment"
        minuteStep={15}
        onChange={(event) => setTime(event.detail as null | string)}
        value={time}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
