// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const hintMessage = document.createElement('c-message');
hintMessage.hint = 'Use your organization email address';

const validationMessage = document.createElement('c-message');
validationMessage.valid = false;
validationMessage.validation = 'Email is required';

row.append(hintMessage, validationMessage);
document.body.append(row);
