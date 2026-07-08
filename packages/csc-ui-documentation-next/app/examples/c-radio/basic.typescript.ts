// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const group = document.createElement('c-radio-group');
group.value = 'free';
group.setAttribute('hint', 'You can change the plan later');
group.setAttribute('label', 'Subscription plan');

const free = document.createElement('c-radio');
free.setAttribute('value', 'free');
free.textContent = 'Free';

const pro = document.createElement('c-radio');
pro.setAttribute('value', 'pro');
pro.textContent = 'Pro';

const enterprise = document.createElement('c-radio');
enterprise.setAttribute('value', 'enterprise');
enterprise.setAttribute('disabled', '');
enterprise.textContent = 'Enterprise';

group.addEventListener('changeValue', (event) => {
  group.value = event.detail as string;
});

group.append(free, pro, enterprise);
wrapper.append(group);
document.body.append(wrapper);
