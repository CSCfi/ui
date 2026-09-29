// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import type { CDatePickerDisabledDate } from '@cscfi/csc-ui';

// No weekends, no Christmas week, nothing before today.
const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

const today = new Date().toISOString().slice(0, 10);

const year = today.slice(0, 4);

const disabledDates: CDatePickerDisabledDate[] = [
  { start: `${year}-12-24`, end: `${year}-12-31` },
];

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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
  disabledDates = disabledDates;
  isWeekend = isWeekend;
  today = today;
  date = signal<string | null>(null);
}
