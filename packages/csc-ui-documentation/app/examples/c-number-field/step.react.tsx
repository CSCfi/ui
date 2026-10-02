// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CNumberField } from '@cscfi/csc-ui-react';

export const Step = () => {
  const [volume, setVolume] = useState<number | null>(50);

  return (
    <div>
      <CNumberField
        value={volume}
        max={100}
        min={0}
        step={5}
        hint="0 to 100, in steps of 5"
        label="Volume"
        onChange={(event) => setVolume(event.detail as number | null)}
      >
        <span slot="post">%</span>
      </CNumberField>

      <p>Value: {volume ?? 'null'}</p>
    </div>
  );
};
