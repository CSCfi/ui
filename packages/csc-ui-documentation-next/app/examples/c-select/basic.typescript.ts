// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const select = document.createElement('c-select');
select.value = null;
select.clearable = true;
select.hint = 'The list opens on click or with the arrow keys';
select.label = 'Country';
select.placeholder = 'Choose a country';

const countries = [
  { name: 'Finland', value: 'fi' },
  { name: 'Sweden', value: 'se' },
  { name: 'Norway', value: 'no' },
  { name: 'Denmark', value: 'dk' },
];

for (const country of countries) {
  const option = document.createElement('c-option');
  option.name = country.name;
  option.value = country.value;
  option.textContent = country.name;

  select.append(option);
}

const status = document.createElement('span');
status.textContent = 'Value: null';

select.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail ?? 'null'}`;
});

wrapper.append(select, status);
document.body.append(wrapper);
