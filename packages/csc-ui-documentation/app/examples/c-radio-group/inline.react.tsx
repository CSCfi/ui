// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CRadio, CRadioGroup } from '@cscfi/csc-ui-react';

export const Inline = () => {
  const [frequency, setFrequency] = useState('weekly');

  return (
    <div>
      <CRadioGroup
        value={frequency}
        hideDetails
        inline
        label="Email frequency"
        onChangeValue={(event) => setFrequency(event.detail as string)}
      >
        <CRadio value="daily">Daily</CRadio>
        <CRadio value="weekly">Weekly</CRadio>
        <CRadio value="never">Never</CRadio>
      </CRadioGroup>
    </div>
  );
};
