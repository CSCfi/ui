// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
for (const size of ['default', 'small'] as const) {
  const group = document.createElement('c-button-group');
  group.setAttribute('mandatory', '');
  group.value = 'list';

  if (size === 'small') group.setAttribute('size', size);

  for (const value of ['list', 'grid']) {
    const button = document.createElement('c-button');
    button.setAttribute('value', value);
    button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

    group.append(button);
  }

  row.append(group);
}

document.body.append(row);
