import type { CDatePickerRange } from '@cscfi/csc-ui';

document.querySelector('#billing')!.addEventListener('change', (event) => {
  document.querySelector('#billing-value')!.textContent =
    `Value: ${event.detail ?? 'null'}`;
});

document.querySelector('#period')!.addEventListener('change', (event) => {
  const period = event.detail as CDatePickerRange | null;

  document.querySelector('#period-value')!.textContent = period
    ? `Value: ${period.start} – ${period.end}`
    : 'Value: null';
});
