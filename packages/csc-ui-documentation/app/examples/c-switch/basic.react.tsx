// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CSwitch } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="example-grid">
      <CSwitch
        value={enabled}
        onChangeValue={(event) => setEnabled(event.detail as boolean)}
      >
        Notifications
      </CSwitch>

      <p>Value: {String(enabled)}</p>
    </div>
  );
};
