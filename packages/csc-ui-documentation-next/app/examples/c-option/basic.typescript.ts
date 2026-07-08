// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const select = document.createElement('c-select');
select.setAttribute('clearable', '');
select.setAttribute('hint', 'Each c-option provides a name and a value');
select.setAttribute('label', 'Country');
select.setAttribute('placeholder', 'Choose a country');

const countries = [
  { name: 'Finland', value: 'fi' },
  { name: 'Sweden', value: 'se' },
  { name: 'Norway', value: 'no' },
  { name: 'Denmark', value: 'dk', disabled: true },
];

for (const country of countries) {
  const option = document.createElement('c-option');
  option.setAttribute('name', country.name);
  option.setAttribute('value', country.value);
  option.textContent = country.name;

  if (country.disabled) {
    option.setAttribute('disabled', '');
  }

  select.append(option);
}

const status = document.createElement('span');
status.textContent = 'Value: null';

select.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail ?? 'null'}`;
});

wrapper.append(select, status);
document.body.append(wrapper);
