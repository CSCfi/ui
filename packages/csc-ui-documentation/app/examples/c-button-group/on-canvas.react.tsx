import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const OnCanvas = () => {
  const [period, setPeriod] = useState<null | string>('monthly');

  return (
    <div className="example-row">
      <CButtonGroup
        label="Billing period"
        onChange={(event) => setPeriod(event.detail as null | string)}
        value={period}
      >
        <CButton value="monthly">Monthly</CButton>
        <CButton value="yearly">Yearly</CButton>
      </CButtonGroup>
    </div>
  );
};
