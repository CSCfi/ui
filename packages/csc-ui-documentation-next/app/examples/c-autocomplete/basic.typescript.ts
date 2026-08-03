const autocomplete = document.querySelector('c-autocomplete')!;

const status = document.querySelector('p')!;

autocomplete.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail ?? 'null'}`;
});
