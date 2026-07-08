// @ts-nocheck — documentation code sample; shown as text, never compiled here
const row = document.createElement('div');
row.className = 'example-row';

// Typed via the HTMLElementTagNameMap augmentation from @cscfi/csc-ui-next.
const tabButtons = document.createElement('c-tab-buttons');
tabButtons.value = 'week';
tabButtons.setAttribute('mandatory', '');

const day = document.createElement('c-tab-button');
day.setAttribute('value', 'day');
day.textContent = 'Day';

const week = document.createElement('c-tab-button');
week.setAttribute('value', 'week');
week.textContent = 'Week';

const month = document.createElement('c-tab-button');
month.setAttribute('value', 'month');
month.setAttribute('disabled', '');
month.textContent = 'Month';

tabButtons.append(day, week, month);

const status = document.createElement('span');
status.textContent = 'Selected: week';

tabButtons.addEventListener('changeValue', (event) => {
  status.textContent = `Selected: ${event.detail}`;
});

row.append(tabButtons, status);
document.body.append(row);
