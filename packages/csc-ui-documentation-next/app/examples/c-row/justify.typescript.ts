// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const row = document.createElement('c-row');
row.setAttribute('align', 'center');
row.setAttribute('justify', 'space-between');

const back = document.createElement('c-button');
back.setAttribute('size', 'small');
back.setAttribute('outlined', '');
back.textContent = 'Back';

const step = document.createElement('span');
step.textContent = 'Step 2 of 3';

const next = document.createElement('c-button');
next.setAttribute('size', 'small');
next.textContent = 'Next';

row.append(back, step, next);
wrapper.append(row);
document.body.append(wrapper);
