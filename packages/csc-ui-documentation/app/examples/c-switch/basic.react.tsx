import { CSwitch } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';

export const Basic = () => {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="example-grid">
      <CSwitch
        onChangeValue={(event) => setEnabled(event.detail as boolean)}
        value={enabled}
      >
        Notifications
      </CSwitch>

      <p>Value: {String(enabled)}</p>
    </div>
  );
};
