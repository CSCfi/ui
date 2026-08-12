const field = document.querySelector('c-text-field')!;

field.rows = 4;

field.addEventListener('changeValue', (event) => {
  field.value = event.detail;
});
