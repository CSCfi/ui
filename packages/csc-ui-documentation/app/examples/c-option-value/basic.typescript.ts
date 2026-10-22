let language: null | string = null;

const autocomplete = document.querySelector('c-autocomplete')!;

const output = document.querySelector('#value')!;

autocomplete.value = language;

autocomplete.addEventListener('changeValue', (event) => {
  language = event.detail as null | string;
  output.textContent = language ?? 'null';
});
