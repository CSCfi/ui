import { CTimePicker } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [time, setTime] = useState<null | string>(null);

  return (
    <div>
      <CTimePicker
        clearable
        hint="Type a time or open the clock"
        label="Start time"
        onChange={(event) => setTime(event.detail as null | string)}
        value={time}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
