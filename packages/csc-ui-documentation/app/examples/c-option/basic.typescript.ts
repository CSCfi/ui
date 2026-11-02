const select = document.querySelector('c-select')!;

const status = document.querySelector('p')!;

select.addEventListener('change', (event) => {
  status.textContent = `Value: ${event.detail ?? 'null'}`;
});
