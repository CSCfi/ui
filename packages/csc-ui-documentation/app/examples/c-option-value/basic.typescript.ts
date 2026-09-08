let language: string | null = null;

const autocomplete = document.querySelector('c-autocomplete')!;
const output = document.querySelector('#value')!;

autocomplete.value = language;

autocomplete.addEventListener('changeValue', (event) => {
  language = event.detail as string | null;
  output.textContent = language ?? 'null';
});
