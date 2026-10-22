const select = document.querySelector('c-select')!;

const status = document.querySelector('p')!;

select.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail ?? 'null'}`;
});
