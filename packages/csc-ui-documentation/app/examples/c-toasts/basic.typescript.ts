const toasts = document.querySelector('c-toasts')!;

const [successButton, errorButton] = document.querySelectorAll('c-button');

successButton!.addEventListener('click', () => {
  toasts.addToast({
    message: 'Your changes have been saved.',
    progress: true,
    title: 'Saved',
    type: 'success',
  });
});

errorButton!.addEventListener('click', () => {
  toasts.addToast({
    message: 'The file could not be uploaded.',
    progress: true,
    title: 'Upload failed',
    type: 'error',
  });
});
