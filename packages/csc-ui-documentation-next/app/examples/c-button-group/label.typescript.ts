// @ts-nocheck — documentation code sample; shown as text, never compiled here
// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const group = document.createElement('c-button-group');
group.setAttribute('label', 'Billing period');
group.setAttribute('required', '');
group.setAttribute('mandatory', '');
group.value = 'monthly';

for (const value of ['monthly', 'yearly']) {
  const button = document.createElement('c-button');
  button.setAttribute('value', value);
  button.textContent = value.charAt(0).toUpperCase() + value.slice(1);

  group.append(button);
}

document.body.append(group);
