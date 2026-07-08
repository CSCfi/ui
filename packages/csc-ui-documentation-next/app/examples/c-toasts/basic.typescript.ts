// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

const successButton = document.createElement('c-button');
successButton.textContent = 'Show success toast';

const errorButton = document.createElement('c-button');
errorButton.textContent = 'Show error toast';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const toasts = document.createElement('c-toasts');

const notify = (type: 'error' | 'success') => {
  toasts.addToast({
    type,
    title: type === 'success' ? 'Saved' : 'Upload failed',
    message:
      type === 'success'
        ? 'Your changes have been saved.'
        : 'The file could not be uploaded.',
    progress: true,
  });
};

successButton.addEventListener('click', () => notify('success'));
errorButton.addEventListener('click', () => notify('error'));

row.append(successButton, errorButton, toasts);
document.body.append(row);
