const toasts = document.querySelector('c-toasts')!;

const [successButton, errorButton] = document.querySelectorAll('c-button');

successButton!.addEventListener('click', () => {
  toasts.addToast({
    heading: 'Saved',
    message: 'Your changes have been saved.',
    progress: true,
    type: 'success',
  });
});

errorButton!.addEventListener('click', () => {
  toasts.addToast({
    heading: 'Upload failed',
    message: 'The file could not be uploaded.',
    progress: true,
    type: 'error',
  });
});
