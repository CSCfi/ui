const status = document.querySelector('p')!;

document.querySelector('c-switch')!.addEventListener('change', (event) => {
  status.textContent = `Value: ${event.detail}`;
});
