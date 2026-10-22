import { CNumberField } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Step = () => {
  const [volume, setVolume] = useState<null | number>(50);

  return (
    <div>
      <CNumberField
        hint="0 to 100, in steps of 5"
        label="Volume"
        max={100}
        min={0}
        onChange={(event) => setVolume(event.detail as null | number)}
        step={5}
        value={volume}
      >
        <span slot="post">%</span>
      </CNumberField>

      <p>Value: {volume ?? 'null'}</p>
    </div>
  );
};
