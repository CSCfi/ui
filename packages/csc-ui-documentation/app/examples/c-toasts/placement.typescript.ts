const toasts = document.querySelector('c-toasts')!;

const [verticalSelect, horizontalSelect] =
  document.querySelectorAll('c-select');

verticalSelect!.addEventListener('change', (event) => {
  toasts.vertical = event.detail as 'bottom' | 'top';
});

horizontalSelect!.addEventListener('change', (event) => {
  toasts.horizontal = event.detail as 'center' | 'left' | 'right';
});

document.querySelector('c-button')!.addEventListener('click', () => {
  toasts.addToast({
    heading: 'Notification',
    message: `Placed at ${toasts.vertical} ${toasts.horizontal}.`,
    progress: true,
    type: 'info',
  });
});
