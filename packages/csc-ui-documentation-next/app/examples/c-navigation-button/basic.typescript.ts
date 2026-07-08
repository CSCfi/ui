// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const button = document.createElement('c-navigation-button');

const status = document.createElement('span');
status.textContent = 'Menu closed';

let menuVisible = false;

button.addEventListener('click', () => {
  menuVisible = !menuVisible;
  status.textContent = `Menu ${menuVisible ? 'open' : 'closed'}`;
});

row.append(button, status);
document.body.append(row);
