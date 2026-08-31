const toasts = document.querySelector('c-toasts')!;

const [verticalSelect, horizontalSelect] =
  document.querySelectorAll('c-select');

verticalSelect!.addEventListener('changeValue', (event) => {
  toasts.vertical = event.detail as 'bottom' | 'top';
});

horizontalSelect!.addEventListener('changeValue', (event) => {
  toasts.horizontal = event.detail as 'center' | 'left' | 'right';
});

document.querySelector('c-button')!.addEventListener('click', () => {
  toasts.addToast({
    type: 'info',
    title: 'Notification',
    message: `Placed at ${toasts.vertical} ${toasts.horizontal}.`,
    progress: true,
  });
});
