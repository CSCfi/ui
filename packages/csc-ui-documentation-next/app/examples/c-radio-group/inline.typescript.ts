// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const group = document.createElement('c-radio-group');
group.value = 'weekly';
group.hideDetails = true;
group.inline = true;
group.label = 'Email frequency';

const daily = document.createElement('c-radio');
daily.value = 'daily';
daily.textContent = 'Daily';

const weekly = document.createElement('c-radio');
weekly.value = 'weekly';
weekly.textContent = 'Weekly';

const never = document.createElement('c-radio');
never.value = 'never';
never.textContent = 'Never';

group.addEventListener('changeValue', (event) => {
  group.value = event.detail;
});

group.append(daily, weekly, never);
wrapper.append(group);
document.body.append(wrapper);
