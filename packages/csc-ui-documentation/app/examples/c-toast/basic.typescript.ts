// Toasts are normally created by c-toasts, which renders a c-toast for
// each message. A persistent message can be shown standalone.
document.querySelector('c-toast')!.message = {
  id: 'example',
  message: 'Your changes have been saved.',
  persistent: true,
  title: 'Saved',
  type: 'success',
};
