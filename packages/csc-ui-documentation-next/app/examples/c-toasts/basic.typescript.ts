const toasts = document.querySelector('c-toasts')!;

const [successButton, errorButton] = document.querySelectorAll('c-button');

successButton!.addEventListener('click', () => {
  toasts.addToast({
    type: 'success',
    title: 'Saved',
    message: 'Your changes have been saved.',
    progress: true,
  });
});

errorButton!.addEventListener('click', () => {
  toasts.addToast({
    type: 'error',
    title: 'Upload failed',
    message: 'The file could not be uploaded.',
    progress: true,
  });
});
