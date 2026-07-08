// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabButtons = document.createElement('c-tab-buttons');
tabButtons.value = 'week';
tabButtons.setAttribute('mandatory', '');

for (const value of ['day', 'week', 'month']) {
  const button = document.createElement('c-tab-button');
  button.setAttribute('value', value);
  button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

  tabButtons.append(button);
}

const status = document.createElement('span');
status.textContent = 'Selected: week';

tabButtons.addEventListener('changeValue', (event) => {
  status.textContent = `Selected: ${event.detail}`;
});

row.append(tabButtons, status);
document.body.append(row);
