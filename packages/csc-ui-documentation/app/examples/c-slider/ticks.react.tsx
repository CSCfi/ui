import { CSlider } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Ticks = () => {
  const [cores, setCores] = useState(2);

  return (
    <div>
      <CSlider
        label="CPU cores"
        labels
        max="8"
        min="0"
        onChangeValue={(event) => setCores(event.detail as number)}
        segments="8"
        step="1"
        ticks
        unit=""
        value={cores}
      />
    </div>
  );
};
