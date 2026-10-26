const checkbox = document.querySelector('c-checkbox')!;

const status = document.querySelector('p')!;

checkbox.addEventListener('change', (event) => {
  checkbox.checked = event.detail as boolean;
  status.textContent = `Value: ${event.detail}`;
});
