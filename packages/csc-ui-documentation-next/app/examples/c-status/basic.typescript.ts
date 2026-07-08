// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const defaultStatus = document.createElement('c-status');
defaultStatus.textContent = 'Default';

const info = document.createElement('c-status');
info.setAttribute('type', 'info');
info.textContent = 'Pending';

const success = document.createElement('c-status');
success.setAttribute('type', 'success');
success.textContent = 'Active';

const warning = document.createElement('c-status');
warning.setAttribute('type', 'warning');
warning.textContent = 'Expiring';

const error = document.createElement('c-status');
error.setAttribute('type', 'error');
error.textContent = 'Failed';

row.append(defaultStatus, info, success, warning, error);
document.body.append(row);
