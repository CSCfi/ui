import type { CDatePickerRange } from '@cscfi/csc-ui';

const picker = document.querySelector('c-date-picker')!;

picker.addEventListener('change', (event) => {
  const leave = event.detail as CDatePickerRange | null;

  document.querySelector('p')!.textContent = leave
    ? `Value: ${leave.start} – ${leave.end}`
    : 'Value: null';
});
