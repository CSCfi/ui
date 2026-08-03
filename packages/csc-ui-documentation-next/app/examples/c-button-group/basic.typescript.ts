const group = document.querySelector('c-button-group')!;

const status = document.querySelector('p')!;

group.addEventListener('change', (event) => {
  status.textContent = `Selected: ${event.detail ?? 'none'}`;
});
