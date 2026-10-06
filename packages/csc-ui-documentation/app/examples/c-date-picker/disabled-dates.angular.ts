import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { end: `${year}-12-31`, start: `${year}-12-24` },
];

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-date-picker
        [value]="date()"
        [disabledDates]="disabledDates"
        [isDateDisabled]="isWeekend"
        [min]="today"
        hint="Weekdays from today, except Christmas week"
        label="Appointment"
        (change)="date.set($any($event).detail)"
      ></c-date-picker>

      <p>Value: {{ date() ?? 'null' }}</p>
    </div>
  `,
})
export class DisabledDatesExampleComponent {
  date = signal<null | string>(null);
  disabledDates = disabledDates;
  isWeekend = isWeekend;
  today = today;
}
