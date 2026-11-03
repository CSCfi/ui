import type { CToastsPosition } from '@cscfi/csc-ui';

const toasts = document.querySelector('c-toasts')!;

document.querySelector('c-select')!.addEventListener('change', (event) => {
  toasts.position = event.detail as CToastsPosition;
});

document.querySelector('c-button')!.addEventListener('click', () => {
  toasts.addToast({
    heading: 'Notification',
    message: `Placed at ${toasts.position}.`,
    progress: true,
    type: 'info',
  });
});
