// @ts-nocheck — documentation code sample; shown as text, never compiled here
let language: string | null = null;

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const autocomplete = document.createElement('c-autocomplete');
autocomplete.value = language;
autocomplete.setAttribute('clearable', '');
autocomplete.setAttribute(
  'hint',
  'c-option-value marks the text that gets match highlighting',
);
autocomplete.setAttribute('label', 'Programming language');
autocomplete.setAttribute('placeholder', 'Start typing to search');

autocomplete.addEventListener('changeValue', (event) => {
  language = event.detail as string | null;
});

const languages = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'rs', label: 'Rust' },
];

for (const { value, label } of languages) {
  const option = document.createElement('c-option');
  option.setAttribute('value', value);

  const optionValue = document.createElement('c-option-value');
  optionValue.textContent = label;

  option.append(optionValue);
  autocomplete.append(option);
}

wrapper.append(autocomplete);
document.body.append(wrapper);
