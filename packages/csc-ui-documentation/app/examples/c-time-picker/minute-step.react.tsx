// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';

export const MinuteStep = () => {
  const [time, setTime] = useState<string | null>(null);

  return (
    <div>
      <CTimePicker
        value={time}
        hint="Slots every 15 minutes; any typed time is kept"
        label="Appointment"
        minuteStep={15}
        onChange={(event) => setTime(event.detail as string | null)}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
