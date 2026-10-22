import { CRadio, CRadioGroup } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Inline = () => {
  const [frequency, setFrequency] = useState('weekly');

  return (
    <div>
      <CRadioGroup
        hideDetails
        inline
        label="Email frequency"
        onChangeValue={(event) => setFrequency(event.detail as string)}
        value={frequency}
      >
        <CRadio value="daily">Daily</CRadio>
        <CRadio value="weekly">Weekly</CRadio>
        <CRadio value="never">Never</CRadio>
      </CRadioGroup>
    </div>
  );
};
