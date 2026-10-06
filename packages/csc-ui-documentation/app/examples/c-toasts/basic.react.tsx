import type { CToastsElement } from '@cscfi/csc-ui';

import { CButton, CToasts } from '@cscfi/csc-ui-react';
// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { useRef } from 'react';

export const Basic = () => {
  const toasts = useRef<CToastsElement>(null);

  const notify = (type: 'error' | 'success') => {
    toasts.current?.addToast({
      message:
        type === 'success'
          ? 'Your changes have been saved.'
          : 'The file could not be uploaded.',
      progress: true,
      title: type === 'success' ? 'Saved' : 'Upload failed',
      type,
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
