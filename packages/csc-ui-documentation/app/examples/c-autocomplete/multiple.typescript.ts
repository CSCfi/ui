import {
  mdiLanguageGo,
  mdiLanguageJavascript,
  mdiLanguagePython,
  mdiLanguageRuby,
  mdiLanguageRust,
  mdiLanguageTypescript,
} from '@mdi/js';

const autocomplete = document.querySelector('c-autocomplete')!;

const status = document.querySelector('p')!;

// Arrays have no attribute form: set the value as a property.
autocomplete.value = ['ts'];

// The icon paths are long strings: set them as properties too.
const icons: Record<string, string> = {
  js: mdiLanguageJavascript,
  ts: mdiLanguageTypescript,
  py: mdiLanguagePython,
  rs: mdiLanguageRust,
  go: mdiLanguageGo,
  rb: mdiLanguageRuby,
};

autocomplete.querySelectorAll('c-option').forEach((option) => {
  option.querySelector('c-icon')!.path = icons[option.value as string];
});

autocomplete.addEventListener('changeValue', (event) => {
  const languages = event.detail as string[];

  status.textContent = `Value: ${languages.length ? languages.join(', ') : '[]'}`;
});
