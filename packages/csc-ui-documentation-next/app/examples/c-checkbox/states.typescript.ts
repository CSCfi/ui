// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const unchecked = document.createElement('c-checkbox');
unchecked.hideDetails = true;
unchecked.textContent = 'Unchecked';

const checked = document.createElement('c-checkbox');
checked.checked = true;
checked.hideDetails = true;
checked.textContent = 'Checked';

const indeterminate = document.createElement('c-checkbox');
indeterminate.indeterminate = true;
indeterminate.hideDetails = true;
indeterminate.textContent = 'Indeterminate';

const disabled = document.createElement('c-checkbox');
disabled.disabled = true;
disabled.hideDetails = true;
disabled.textContent = 'Disabled';

const checkedDisabled = document.createElement('c-checkbox');
checkedDisabled.checked = true;
checkedDisabled.disabled = true;
checkedDisabled.hideDetails = true;
checkedDisabled.textContent = 'Checked and disabled';

row.append(unchecked, checked, indeterminate, disabled, checkedDisabled);
document.body.append(row);
