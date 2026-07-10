// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const group = document.createElement('c-button-group');
group.value = 'week';

for (const value of ['day', 'week', 'month']) {
  const button = document.createElement('c-button');
  button.setAttribute('value', value);
  button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

  group.append(button);
}

const status = document.createElement('span');
status.textContent = 'Selected: week';

group.addEventListener('change', (event) => {
  status.textContent = `Selected: ${event.detail ?? 'none'}`;
});

row.append(group, status);
document.body.append(row);
