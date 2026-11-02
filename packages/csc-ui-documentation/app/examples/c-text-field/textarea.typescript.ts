const field = document.querySelector('c-text-field')!;

field.rows = 4;

field.addEventListener('update:value', (event) => {
  field.value = event.detail;
});
