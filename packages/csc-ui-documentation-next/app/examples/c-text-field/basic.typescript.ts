// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const field = document.createElement('c-text-field');
field.value = '';
field.hint = 'Shown on your public profile';
field.label = 'Display name';

const status = document.createElement('span');
status.textContent = 'Value: ';

field.addEventListener('changeValue', (event) => {
  status.textContent = `Value: ${event.detail}`;
});

wrapper.append(field, status);
document.body.append(wrapper);
