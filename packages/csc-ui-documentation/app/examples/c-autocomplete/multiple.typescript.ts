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

// The icon paths are long strings: set them as properties too, along with
// each language's brand colour.
const icons: Record<string, { color: string; path: string }> = {
  js: { color: '#F7DF1E', path: mdiLanguageJavascript },
  ts: { color: '#3178C6', path: mdiLanguageTypescript },
  py: { color: '#3776AB', path: mdiLanguagePython },
  rs: { color: '#CE422B', path: mdiLanguageRust },
  go: { color: '#00ADD8', path: mdiLanguageGo },
  rb: { color: '#CC342D', path: mdiLanguageRuby },
};

autocomplete.querySelectorAll('c-option').forEach((option) => {
  const icon = option.querySelector('c-icon')!;
  const { color, path } = icons[option.value as string];

  icon.color = color;
  icon.path = path;
});

autocomplete.addEventListener('changeValue', (event) => {
  const languages = event.detail as string[];

  status.textContent = `Value: ${languages.length ? languages.join(', ') : '[]'}`;
});
