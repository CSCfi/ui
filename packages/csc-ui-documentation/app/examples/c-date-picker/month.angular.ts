import type { CDatePickerRange } from '@cscfi/csc-ui';

// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-example',
  standalone: true,
  template: `
    <div>
      <c-date-picker
        [value]="billing()"
        hint="Type a month or open the month list"
        label="Billing month"
        type="month"
        clearable
        (change)="billing.set($any($event).detail)"
      ></c-date-picker>

      <p>Value: {{ billing() ?? 'null' }}</p>

      <c-date-picker
        [value]="period()"
        label="Reporting period"
        type="month"
        range
        clearable
        (change)="period.set($any($event).detail)"
      ></c-date-picker>

      <p>
        Value: {{ period() ? period()!.start + ' – ' + period()!.end : 'null' }}
      </p>
    </div>
  `,
})
export class MonthExampleComponent {
  billing = signal<null | string>(null);
  period = signal<CDatePickerRange | null>(null);
}
