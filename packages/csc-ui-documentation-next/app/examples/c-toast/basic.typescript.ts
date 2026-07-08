// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Toasts are normally created by c-toasts, which renders a c-toast for
// each message. A persistent message can be shown standalone.
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const toast = document.createElement('c-toast');
toast.message = {
  id: 'example',
  title: 'Saved',
  message: 'Your changes have been saved.',
  type: 'success',
  persistent: true,
};

wrapper.append(toast);
document.body.append(wrapper);
