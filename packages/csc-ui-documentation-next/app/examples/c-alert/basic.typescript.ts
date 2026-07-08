// @ts-nocheck — documentation code sample; shown as text, never compiled here
const wrapper = document.createElement('div');

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const alert = document.createElement('c-alert');
alert.setAttribute('type', 'warning');

const title = document.createElement('div');
title.slot = 'title';
title.textContent = 'Maintenance break';

alert.append(
  title,
  'The service will be unavailable on Saturday between 10:00 and 12:00.',
);

wrapper.append(alert);
document.body.append(wrapper);
