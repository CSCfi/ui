// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const steps = document.createElement('c-steps');
steps.setAttribute('value', '3');

for (const label of [
  'Choose resources',
  'Billing details',
  'Review',
  'Confirmation',
]) {
  const step = document.createElement('c-step');
  step.textContent = label;
  steps.append(step);
}

wrapper.append(steps);
document.body.append(wrapper);
