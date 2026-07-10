// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
// Arrays have no attribute form — assign the `value` property.
const group = document.createElement('c-button-group');
group.setAttribute('label', 'Toppings');
group.setAttribute('multiple', '');
group.value = ['cheese'];

for (const value of ['cheese', 'pepperoni', 'mushroom']) {
  const button = document.createElement('c-button');
  button.setAttribute('value', value);
  button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

  group.append(button);
}

const status = document.createElement('span');
status.textContent = 'Selected: cheese';

group.addEventListener('change', (event) => {
  const selected = event.detail as string[];
  status.textContent = `Selected: ${selected.length ? selected.join(', ') : 'none'}`;
});

row.append(group, status);
document.body.append(row);
