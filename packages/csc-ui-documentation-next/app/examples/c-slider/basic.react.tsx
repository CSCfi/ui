// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CSlider } from '@cscfi/csc-ui-next-react';

export const Basic = () => {
  const [volume, setVolume] = useState(40);

  return (
    <div>
      <CSlider
        value={volume}
        label="Volume"
        onChangeValue={(event) => setVolume(event.detail as number)}
      />

      <span>Value: {volume} %</span>
    </div>
  );
};
