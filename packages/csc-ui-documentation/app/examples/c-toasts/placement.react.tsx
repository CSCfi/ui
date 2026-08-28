// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useRef, useState } from 'react';
import { CButton, COption, CSelect, CToasts } from '@cscfi/csc-ui-react';
import type { CToastsElement } from '@cscfi/csc-ui';

export const Placement = () => {
  const toasts = useRef<CToastsElement>(null);

  const [vertical, setVertical] = useState('bottom');

  const [horizontal, setHorizontal] = useState('center');

  const notify = () => {
    toasts.current?.addToast({
      type: 'info',
      title: 'Notification',
      message: `Placed at ${vertical} ${horizontal}.`,
      progress: true,
    });
  };

  return (
    <div className="example-row">
      <CSelect
        value={vertical}
        label="Vertical"
        onChangeValue={(event) => setVertical(event.detail as string)}
      >
        <COption name="Bottom" value="bottom">
          Bottom
        </COption>
        <COption name="Top" value="top">
          Top
        </COption>
      </CSelect>

      <CSelect
        value={horizontal}
        label="Horizontal"
        onChangeValue={(event) => setHorizontal(event.detail as string)}
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

      <CToasts ref={toasts} horizontal={horizontal} vertical={vertical} />
    </div>
  );
};
