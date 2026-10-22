import type { CToastsElement } from '@cscfi/csc-ui';

import { CButton, COption, CSelect, CToasts } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useRef, useState } from 'react';

export const Placement = () => {
  const toasts = useRef<CToastsElement>(null);

  const [vertical, setVertical] = useState('bottom');

  const [horizontal, setHorizontal] = useState('center');

  const notify = () => {
    toasts.current?.addToast({
      message: `Placed at ${vertical} ${horizontal}.`,
      progress: true,
      title: 'Notification',
      type: 'info',
    });
  };

  return (
    <div className="example-row">
      <CSelect
        label="Vertical"
        onChangeValue={(event) => setVertical(event.detail as string)}
        value={vertical}
      >
        <COption name="Bottom" value="bottom">
          Bottom
        </COption>
        <COption name="Top" value="top">
          Top
        </COption>
      </CSelect>

      <CSelect
        label="Horizontal"
        onChangeValue={(event) => setHorizontal(event.detail as string)}
        value={horizontal}
      >
        <COption name="Left" value="left">
          Left
        </COption>
        <COption name="Center" value="center">
          Center
        </COption>
        <COption name="Right" value="right">
          Right
        </COption>
      </CSelect>

      <CButton onClick={notify}>Show toast</CButton>

      <CToasts horizontal={horizontal} ref={toasts} vertical={vertical} />
    </div>
  );
};
