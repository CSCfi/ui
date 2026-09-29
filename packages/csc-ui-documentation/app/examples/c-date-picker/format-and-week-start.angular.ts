// @ts-nocheck — documentation code sample; shown as text, never compiled here
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <c-date-picker
        [value]="date()"
        [firstDayOfWeek]="0"
        format="M/d/yyyy"
        label="Due date"
        show-week-numbers
        (change)="date.set($any($event).detail)"
      ></c-date-picker>

      <p>Value: {{ date() ?? 'null' }}</p>
    </div>
  `,
})
export class FormatAndWeekStartExampleComponent {
  date = signal<string | null>('2026-09-28');
}
