// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const small = document.createElement('c-button');
small.setAttribute('size', 'small');
small.textContent = 'Small';

const defaultButton = document.createElement('c-button');
defaultButton.textContent = 'Default';

const large = document.createElement('c-button');
large.setAttribute('size', 'large');
large.textContent = 'Large';

row.append(small, defaultButton, large);
document.body.append(row);
