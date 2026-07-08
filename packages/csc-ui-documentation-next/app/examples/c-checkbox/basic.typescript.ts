// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const checkbox = document.createElement('c-checkbox');
checkbox.checked = false;
checkbox.setAttribute('hint', 'You can unsubscribe at any time');
checkbox.textContent = 'Subscribe to the newsletter';

const status = document.createElement('span');
status.textContent = 'Value: false';

checkbox.addEventListener('changeValue', (event) => {
  checkbox.checked = event.detail as boolean;
  status.textContent = `Value: ${event.detail}`;
});

row.append(checkbox, status);
document.body.append(row);
