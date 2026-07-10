// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const group = document.createElement('c-button-group');
group.setAttribute('label', 'Alignment');
group.setAttribute('mandatory', '');
group.value = 'left';

for (const value of ['left', 'center', 'right']) {
  const button = document.createElement('c-button');
  button.setAttribute('value', value);
  button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

  group.append(button);
}

const status = document.createElement('span');
status.textContent = 'Selected: left';

group.addEventListener('change', (event) => {
  status.textContent = `Selected: ${event.detail} — the active button cannot be toggled off`;
});

row.append(group, status);
document.body.append(row);
