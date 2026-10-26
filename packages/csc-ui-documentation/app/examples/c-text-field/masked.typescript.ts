const field = document.querySelector('c-text-field')!;

const status = document.querySelector('p')!;

field.addEventListener('update:value', (event) => {
  status.textContent = `Value: ${event.detail} (digits: ${field.unmaskedValue})`;
});
