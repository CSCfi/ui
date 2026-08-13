const status = document.querySelector('p')!;

document.querySelector('c-switch')!.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail}`;
});
