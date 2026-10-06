import type { CToastMessage } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { CToast } from '@cscfi/csc-ui-react';

export const Basic = () => {
  const message: CToastMessage = {
    id: 'example',
    message: 'Your changes have been saved.',
    persistent: true,
    title: 'Saved',
    type: 'success',
  };

  return (
    <div>
      {/* Toasts are normally created by c-toasts, which renders a c-toast for
          each message. A persistent message can be shown standalone. */}
      <CToast message={message} />
    </div>
  );
};
