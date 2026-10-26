import { CSlider } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [volume, setVolume] = useState(40);

  return (
    <div>
      <CSlider
        label="Volume"
        onUpdateValue={(event) => setVolume(event.detail as number)}
        unit="%"
        value={volume}
      />

      <p>Value: {volume} %</p>
    </div>
  );
};
