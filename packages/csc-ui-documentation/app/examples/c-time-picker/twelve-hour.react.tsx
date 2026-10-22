import { CTimePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const TwelveHour = () => {
  const [time, setTime] = useState<null | string>('14:30');

  return (
    <div>
      <CTimePicker
        format="h:mm a"
        label="Meeting time"
        onChange={(event) => setTime(event.detail as null | string)}
        value={time}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
