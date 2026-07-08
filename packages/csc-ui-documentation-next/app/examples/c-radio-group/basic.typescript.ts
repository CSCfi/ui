// @ts-nocheck — documentation code sample; shown as text, never compiled here
let plan = 'free';

const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const group = document.createElement('c-radio-group');
group.value = plan;
group.setAttribute('hint', 'You can change the plan later');
group.setAttribute('label', 'Subscription plan');

const options = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
];

for (const option of options) {
  const radio = document.createElement('c-radio');
  radio.setAttribute('value', option.value);
  radio.textContent = option.label;
  group.append(radio);
}

group.addEventListener('changeValue', (event) => {
  plan = event.detail as string;
});

wrapper.append(group);
document.body.append(wrapper);
