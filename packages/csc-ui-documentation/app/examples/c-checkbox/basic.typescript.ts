const checkbox = document.querySelector('c-checkbox')!;
const status = document.querySelector('p')!;

checkbox.addEventListener('changeValue', (event) => {
  checkbox.checked = event.detail as boolean;
  status.textContent = `Value: ${event.detail}`;
});
