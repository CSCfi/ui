import type { CTimePickerRange } from '@cscfi/csc-ui';

const picker = document.querySelector('c-time-picker')!;

picker.addEventListener('change', (event) => {
  const maintenance = event.detail as CTimePickerRange | null;

  document.querySelector('p')!.textContent = maintenance
    ? `Value: ${maintenance.start} – ${maintenance.end}`
    : 'Value: null';
});
