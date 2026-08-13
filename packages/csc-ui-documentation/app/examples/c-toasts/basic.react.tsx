// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useRef } from 'react';
import { CButton, CToasts } from '@cscfi/csc-ui-react';
import type { CToastsElement } from '@cscfi/csc-ui';

export const Basic = () => {
  const toasts = useRef<CToastsElement>(null);

  const notify = (type: 'error' | 'success') => {
    toasts.current?.addToast({
      type,
      title: type === 'success' ? 'Saved' : 'Upload failed',
      message:
        type === 'success'
          ? 'Your changes have been saved.'
          : 'The file could not be uploaded.',
      progress: true,
    });
  };

  return (
    <div className="example-row">
      <CButton onClick={() => notify('success')}>Show success toast</CButton>

      <CButton onClick={() => notify('error')}>Show error toast</CButton>

      <CToasts ref={toasts} />
    </div>
  );
};
