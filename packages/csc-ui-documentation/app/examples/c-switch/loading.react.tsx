// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useState } from 'react';
import { CSwitch } from '@cscfi/csc-ui-react';

export const Loading = () => {
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);

  // Simulated round trip: `loading` shows the spinner in place of the handle
  // and `disabled` refuses further input until the server has answered.
  // `loading` alone does not block clicks.
  const onToggle = (event: CustomEvent<boolean>) => {
    setPending(true);

    window.setTimeout(() => {
      setEnabled(event.detail);
      setPending(false);
    }, 1500);
  };

  return (
    <div className="example-grid">
      <CSwitch
        disabled={pending}
        loading={pending}
        value={enabled}
        onChangeValue={onToggle}
      >
        Sync to cloud
      </CSwitch>

      <p>{pending ? 'Saving…' : `Value: ${String(enabled)}`}</p>
    </div>
  );
};
