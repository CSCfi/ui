let language: string | null = null;

const autocomplete = document.querySelector('c-autocomplete')!;

autocomplete.value = language;

autocomplete.addEventListener('changeValue', (event) => {
  language = event.detail as string | null;
});
