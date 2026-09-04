// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CButton, CButtonGroup } from '@cscfi/csc-ui-react';

export const OnCanvas = () => {
  const [period, setPeriod] = useState<string | null>('monthly');

  return (
    <div className="example-row">
      <CButtonGroup
        label="Billing period"
        value={period}
        onChange={(event) => setPeriod(event.detail as string | null)}
      >
        <CButton value="monthly">Monthly</CButton>
        <CButton value="yearly">Yearly</CButton>
      </CButtonGroup>
    </div>
  );
};
