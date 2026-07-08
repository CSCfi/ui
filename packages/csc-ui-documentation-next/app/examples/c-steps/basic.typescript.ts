// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

let step = 1;

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const steps = document.createElement('c-steps');

for (const label of [
  'Choose resources',
  'Billing details',
  'Review',
  'Confirmation',
]) {
  const stepItem = document.createElement('c-step');
  stepItem.textContent = label;
  steps.append(stepItem);
}

const row = document.createElement('div');
row.className = 'example-row';

const previous = document.createElement('c-button');
previous.outlined = true;
previous.textContent = 'Previous';

const next = document.createElement('c-button');
next.textContent = 'Next';

const update = () => {
  steps.value = step;
  previous.disabled = step === 1;
  next.disabled = step === 5;
};

previous.addEventListener('click', () => {
  step--;
  update();
});

next.addEventListener('click', () => {
  step++;
  update();
});

update();

row.append(previous, next);
wrapper.append(steps, row);
document.body.append(wrapper);
