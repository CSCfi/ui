// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const defaultSpinner = document.createElement('c-spinner');

const sizedSpinner = document.createElement('c-spinner');
sizedSpinner.setAttribute('size', '48');
sizedSpinner.setAttribute('width', '4');

const coloredSpinner = document.createElement('c-spinner');
coloredSpinner.setAttribute('size', '48');
coloredSpinner.setAttribute('width', '4');
coloredSpinner.setAttribute('color', 'var(--c-success)');

row.append(defaultSpinner, sizedSpinner, coloredSpinner);
document.body.append(row);
