// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-grid';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const toggle = document.createElement('c-switch');
toggle.textContent = 'Notifications';

const status = document.createElement('span');
status.textContent = 'Value: false';

toggle.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail}`;
});

row.append(toggle, status);
document.body.append(row);
