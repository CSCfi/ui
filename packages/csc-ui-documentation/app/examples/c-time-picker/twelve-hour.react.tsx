// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';

export const TwelveHour = () => {
  const [time, setTime] = useState<string | null>('14:30');

  return (
    <div>
      <CTimePicker
        value={time}
        format="h:mm a"
        label="Meeting time"
        onChange={(event) => setTime(event.detail as string | null)}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
