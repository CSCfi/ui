const field = document.querySelector('c-text-field')!;
const status = document.querySelector('p')!;

field.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail}`;
});
