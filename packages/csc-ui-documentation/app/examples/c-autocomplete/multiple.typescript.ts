const autocomplete = document.querySelector('c-autocomplete')!;

const status = document.querySelector('p')!;

// Arrays have no attribute form: set the value as a property.
autocomplete.value = ['ts'];

autocomplete.addEventListener('changeValue', (event) => {
  const languages = event.detail as string[];

  status.textContent = `Value: ${languages.length ? languages.join(', ') : '[]'}`;
});
