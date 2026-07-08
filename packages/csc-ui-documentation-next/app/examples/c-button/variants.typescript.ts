// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const defaultButton = document.createElement('c-button');
defaultButton.textContent = 'Default';

const outlined = document.createElement('c-button');
outlined.setAttribute('outlined', '');
outlined.textContent = 'Outlined';

const ghost = document.createElement('c-button');
ghost.setAttribute('ghost', '');
ghost.textContent = 'Ghost';

const text = document.createElement('c-button');
text.setAttribute('text', '');
text.textContent = 'Text';

const danger = document.createElement('c-button');
danger.setAttribute('danger', '');
danger.textContent = 'Danger';

const disabled = document.createElement('c-button');
disabled.setAttribute('disabled', '');
disabled.textContent = 'Disabled';

row.append(defaultButton, outlined, ghost, text, danger, disabled);
document.body.append(row);
