// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CToast } from '@cscfi/csc-ui-react';
import type { CToastMessage } from '@cscfi/csc-ui';

export const Basic = () => {
  const message: CToastMessage = {
    id: 'example',
    title: 'Saved',
    message: 'Your changes have been saved.',
    type: 'success',
    persistent: true,
  };

  return (
    <div>
      {/* Toasts are normally created by c-toasts, which renders a c-toast for
          each message. A persistent message can be shown standalone. */}
      <CToast message={message} />
    </div>
  );
};
