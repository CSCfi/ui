// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const logo = document.createElement('c-csc-logo');

const smallLogo = document.createElement('c-csc-logo');
smallLogo.setAttribute('width', '120');

row.append(logo, smallLogo);
document.body.append(row);
