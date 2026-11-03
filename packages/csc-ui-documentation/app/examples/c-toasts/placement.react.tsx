import type { CToastsElement, CToastsPosition } from '@cscfi/csc-ui';

import { CButton, COption, CSelect, CToasts } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useRef, useState } from 'react';

export const Placement = () => {
  const toasts = useRef<CToastsElement>(null);

  const [position, setPosition] = useState<CToastsPosition>('bottom');

  const notify = () => {
    toasts.current?.addToast({
      heading: 'Notification',
      message: `Placed at ${position}.`,
      progress: true,
      type: 'info',
    });
  };

  return (
    <div className="example-row">
      <CSelect
        label="Position"
        onChange={(event) => setPosition(event.detail as CToastsPosition)}
        value={position}
      >
        <COption name="Top start" value="top-start">
          Top start
        </COption>
        <COption name="Top" value="top">
          Top
        </COption>
        <COption name="Top end" value="top-end">
          Top end
        </COption>
        <COption name="Bottom start" value="bottom-start">
          Bottom start
        </COption>
        <COption name="Bottom" value="bottom">
          Bottom
        </COption>
        <COption name="Bottom end" value="bottom-end">
          Bottom end
        </COption>
      </CSelect>

      <CButton onClick={notify}>Show toast</CButton>

      <CToasts position={position} ref={toasts} />
    </div>
  );
};
