// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const row = document.createElement('c-row');
row.setAttribute('align', 'center');
row.setAttribute('gap', '12');

for (const label of ['First', 'Second', 'Third']) {
  const button = document.createElement('c-button');
  button.setAttribute('size', 'small');
  button.setAttribute('outlined', '');
  button.textContent = label;

  row.append(button);
}

wrapper.append(row);
document.body.append(wrapper);
