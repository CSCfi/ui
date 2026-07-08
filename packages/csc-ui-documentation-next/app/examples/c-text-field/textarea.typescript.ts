// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const field = document.createElement('c-text-field');
field.value = '';
field.hint = 'A rows value above 1 renders a textarea';
field.label = 'Description';
field.rows = 4;

field.addEventListener('changeValue', (event) => {
  field.value = event.detail;
});

wrapper.append(field);
document.body.append(wrapper);
