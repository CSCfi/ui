// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CTimePicker } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [time, setTime] = useState<string | null>(null);

  return (
    <div>
      <CTimePicker
        value={time}
        hint="Type a time or open the clock"
        label="Start time"
        clearable
        onChange={(event) => setTime(event.detail as string | null)}
      />

      <p>Value: {time ?? 'null'}</p>
    </div>
  );
};
