const group = document.querySelector('c-button-group')!;

const status = document.querySelector('p')!;

group.value = ['cheese'];

group.addEventListener('change', (event) => {
  const selected = event.detail as string[];

  status.textContent = `Selected: ${selected.length ? selected.join(', ') : 'none'}`;
});
