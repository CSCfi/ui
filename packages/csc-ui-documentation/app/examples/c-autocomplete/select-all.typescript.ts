const autocomplete = document.querySelector('c-autocomplete')!;

const status = document.querySelector('p')!;

// Arrays and objects have no attribute form: set them as properties.
autocomplete.value = ['ts'];
autocomplete.texts = {
  selectAll: (count: number) => `Select all ${count} matches`,
};

autocomplete.addEventListener('changeValue', (event) => {
  const languages = event.detail as string[];

  status.textContent = `Value: ${languages.length ? languages.join(', ') : '[]'}`;
});
