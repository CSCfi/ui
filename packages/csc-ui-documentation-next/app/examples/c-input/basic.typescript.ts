// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const field = document.createElement('c-input');
field.setAttribute(
  'hint',
  'c-input is the field shell — you provide the native input',
);
field.setAttribute('input-id', 'example-search');
field.setAttribute('label', 'Search');
field.filled = false;

const input = document.createElement('input');
input.id = 'example-search';
input.type = 'text';

input.addEventListener('input', () => {
  field.filled = input.value.length > 0;
});

field.append(input);
wrapper.append(field);
document.body.append(wrapper);
