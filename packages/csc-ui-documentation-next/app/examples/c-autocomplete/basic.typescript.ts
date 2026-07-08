// @ts-nocheck — documentation code sample; shown as text, never compiled here
const container = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const autocomplete = document.createElement('c-autocomplete');
autocomplete.setAttribute('clearable', '');
autocomplete.setAttribute('hint', 'Type to filter the options');
autocomplete.setAttribute('label', 'Programming language');
autocomplete.setAttribute('placeholder', 'Start typing to search');
autocomplete.value = null;

const languages = [
  ['js', 'JavaScript'],
  ['ts', 'TypeScript'],
  ['py', 'Python'],
  ['rs', 'Rust'],
];

for (const [value, name] of languages) {
  const option = document.createElement('c-option');
  option.setAttribute('value', value);

  const optionValue = document.createElement('c-option-value');
  optionValue.textContent = name;

  option.append(optionValue);
  autocomplete.append(option);
}

const status = document.createElement('span');
status.textContent = 'Value: null';

autocomplete.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail ?? 'null'}`;
});

container.append(autocomplete, status);
document.body.append(container);
