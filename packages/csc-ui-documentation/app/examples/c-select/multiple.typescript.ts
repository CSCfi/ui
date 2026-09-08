const select = document.querySelector('c-select')!;

const status = document.querySelector('p')!;

// Arrays have no attribute form: set the value as a property.
select.value = ['fi', 'se'];

select.addEventListener('changeValue', (event) => {
  const countries = event.detail as string[];

  status.textContent = `Value: ${countries.length ? countries.join(', ') : '[]'}`;
});
