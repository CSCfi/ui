// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CSlider } from '@cscfi/csc-ui-next-react';

export const Ticks = () => {
  const [cores, setCores] = useState(2);

  return (
    <div>
      <CSlider
        value={cores}
        label="CPU cores"
        labels
        max="8"
        min="0"
        segments="8"
        step="1"
        ticks
        unit=""
        onChangeValue={(event) => setCores(event.detail as number)}
      />
    </div>
  );
};
