import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { end: `${year}-12-31`, start: `${year}-12-24` },
];

// Arrays and functions have no attribute form: set them as DOM properties.
const picker = document.querySelector('c-date-picker')!;
picker.disabledDates = disabledDates;
picker.isDateDisabled = isWeekend;
picker.min = today;

picker.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent = `Value: ${event.detail ?? 'null'}`;
});
