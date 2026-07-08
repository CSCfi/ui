// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const row = document.createElement('c-row');
row.setAttribute('align', 'center');

const back = document.createElement('c-button');
back.setAttribute('outlined', '');
back.textContent = 'Back';

const spacer = document.createElement('c-spacer');

const next = document.createElement('c-button');
next.textContent = 'Continue';

row.append(back, spacer, next);
wrapper.append(row);
document.body.append(wrapper);
