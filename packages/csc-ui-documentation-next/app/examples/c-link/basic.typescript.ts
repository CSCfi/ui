// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const defaultLink = document.createElement('c-link');
defaultLink.href = 'https://csc.fi';
defaultLink.textContent = 'Default link';

const underlinedLink = document.createElement('c-link');
underlinedLink.href = 'https://csc.fi';
underlinedLink.underline = true;
underlinedLink.textContent = 'Underlined link';

const newTabLink = document.createElement('c-link');
newTabLink.href = 'https://csc.fi';
newTabLink.target = '_blank';
newTabLink.textContent = 'Opens in a new tab';

const normalWeightLink = document.createElement('c-link');
normalWeightLink.href = 'https://csc.fi';
normalWeightLink.weight = '400';
normalWeightLink.textContent = 'Normal weight';

row.append(defaultLink, underlinedLink, newTabLink, normalWeightLink);
document.body.append(row);
